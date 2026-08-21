import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Greedy Maximal Matching Size",
      difficulty: "Easy",
      variation: "Greedy maximal matching",
      question: [
        "You are given a bipartite graph with n nodes on the left (numbered 0 to n-1) and m nodes on the right (numbered 0 to m-1), described by an adjacency list where adj[u] lists the right-side nodes that left node u can pair with. Process the left nodes in order 0, 1, ..., n-1 and greedily pair each one with the first still-free right node in its list. Return the size of the matching produced this way.",
        "Example 1:\nInput: n = 3, m = 3, adj = [[0,1],[0],[1,2]]\nOutput: 2\nExplanation: Left 0 takes right 0, left 1 finds right 0 taken and stays free, left 2 takes right 1. Note the true maximum is 3, so greedy is not optimal here.",
        "Example 2:\nInput: n = 2, m = 2, adj = [[0],[1]]\nOutput: 2\nExplanation: No conflicts, so greedy is optimal.",
        "Constraints:\n- 1 <= n, m <= 1000\n- Every value in adj[u] is in the range 0 to m-1\n- Edges only run from the left side to the right side",
      ],
      code: `int greedyMatching(int n, int m, vector<vector<int>>& adj) {
    vector<int> matchRight(m, -1);
    int result = 0;
    for (int u = 0; u < n; u++) {
        for (int v : adj[u]) {
            if (matchRight[v] == -1) {
                matchRight[v] = u;
                result++;
                break;
            }
        }
    }
    return result;
}`,
      explanation: [
        "Each left node claims the first free right node it sees and never gives it up. The result is a maximal matching: no edge can be added without touching an already matched node.",
        "Maximal is weaker than maximum. A greedy matching can be as small as half the true maximum, because a bad early choice can block two later nodes that had no other option. Fixing that requires augmenting paths, which is what Kuhn's algorithm adds on top of this.",
        "Greedy is still useful as a warm start: seeding a maximum matching routine with it usually removes most of the augmenting searches.",
        "Time: O(V + E). Space: O(m).",
      ],
    },
    {
      name: "Maximum Bipartite Matching (Kuhn's Algorithm)",
      difficulty: "Medium",
      variation: "Kuhn's augmenting paths",
      question: [
        "You are given a bipartite graph with n nodes on the left and m nodes on the right, described by an adjacency list where adj[u] lists the right-side nodes that left node u can be matched to. Return the size of a maximum matching, meaning the largest possible set of edges no two of which share an endpoint.",
        "Example 1:\nInput: n = 3, m = 3, adj = [[0,1],[0],[1,2]]\nOutput: 3\nExplanation: Match left 0 with right 1, left 1 with right 0, left 2 with right 2.",
        "Example 2:\nInput: n = 3, m = 1, adj = [[0],[0],[0]]\nOutput: 1\nExplanation: All three left nodes compete for the single right node.",
        "Constraints:\n- 1 <= n, m <= 500\n- Total number of edges <= 10^5\n- Edges only run from the left side to the right side",
      ],
      code: `int maxMatching(int n, int m, vector<vector<int>>& adj) {
    vector<int> matchRight(m, -1);
    vector<char> used;
    function<bool(int)> tryKuhn = [&](int u) -> bool {
        for (int v : adj[u]) {
            if (used[v]) continue;
            used[v] = 1;
            if (matchRight[v] == -1 || tryKuhn(matchRight[v])) {
                matchRight[v] = u;
                return true;
            }
        }
        return false;
    };
    int result = 0;
    for (int u = 0; u < n; u++) {
        used.assign(m, 0);
        if (tryKuhn(u)) result++;
    }
    return result;
}`,
      explanation: [
        "Kuhn's algorithm repeatedly searches for an augmenting path: an alternating path that starts at an unmatched left node, walks a free edge to the right, a matched edge back to the left, and so on, until it reaches an unmatched right node. Flipping every edge along the path grows the matching by exactly one and never breaks it, because each intermediate node simply swaps one partner for another.",
        "Berge's theorem says a matching is maximum exactly when no augmenting path exists. Since every left node gets one search attempt and a node that fails once can never become augmentable later (the matching only ever grows on the right), one pass over the left side is enough.",
        "The used array marks right nodes already explored in the current search, which stops the recursion from cycling and bounds one search by O(E).",
        "Time: O(V * E). Space: O(V).",
      ],
    },
    {
      name: "Maximum Number of Accepted Invitations",
      difficulty: "Medium",
      variation: "Kuhn's on a 0/1 grid",
      link: "https://leetcode.com/problems/maximum-number-of-accepted-invitations/",
      question: [
        "There are m boys and n girls in a class attending an upcoming party. You are given an m x n integer matrix grid, where grid[i][j] equals 1 if the i-th boy can invite the j-th girl to the party, and 0 otherwise. A boy can invite at most one girl, and a girl can accept at most one invitation. Return the maximum possible number of accepted invitations.",
        "Example 1:\nInput: grid = [[1,1,1],[1,0,1],[0,0,1]]\nOutput: 3\nExplanation: Boy 0 invites girl 1, boy 1 invites girl 0, boy 2 invites girl 2.",
        "Example 2:\nInput: grid = [[1,0,1,0],[1,0,0,0],[0,0,1,0],[1,1,1,0]]\nOutput: 3\nExplanation: Girl 3 can never be invited, so at most three invitations are accepted.",
        "Constraints:\n- grid.length == m\n- grid[i].length == n\n- 1 <= m, n <= 200\n- grid[i][j] is either 0 or 1",
      ],
      code: `int maximumInvitations(vector<vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size();
    vector<int> matchGirl(n, -1);
    vector<char> used(n, 0);
    function<bool(int)> tryKuhn = [&](int b) -> bool {
        for (int g = 0; g < n; g++) {
            if (grid[b][g] == 0 || used[g]) continue;
            used[g] = 1;
            if (matchGirl[g] == -1 || tryKuhn(matchGirl[g])) {
                matchGirl[g] = b;
                return true;
            }
        }
        return false;
    };
    int result = 0;
    for (int b = 0; b < m; b++) {
        fill(used.begin(), used.end(), 0);
        if (tryKuhn(b)) result++;
    }
    return result;
}`,
      explanation: [
        "The matrix is an adjacency matrix of a bipartite graph: boys on the left, girls on the right, an edge wherever grid[i][j] is 1. The maximum number of accepted invitations is exactly the maximum matching.",
        "The same Kuhn routine applies, with the inner loop scanning the row of the matrix instead of an adjacency list. Because a girl already matched can be reassigned when her current boy finds another option, greedy row-by-row assignment is not enough and the augmenting recursion is required.",
        "Time: O(m * m * n) in the worst case, which is fine for m, n <= 200. Space: O(n).",
      ],
    },
    {
      name: "Maximum Tasks Assigned to Workers",
      difficulty: "Medium",
      variation: "Kuhn's augmenting paths",
      question: [
        "A company has n workers and m tasks. Worker i is qualified for the tasks listed in skills[i]. Each worker can be given at most one task and each task can be given to at most one worker. Return the maximum number of tasks that can be assigned.",
        "Example 1:\nInput: n = 4, m = 3, skills = [[0,1],[0],[1,2],[2]]\nOutput: 3\nExplanation: Worker 0 takes task 1, worker 1 takes task 0, worker 3 takes task 2. Worker 2 is left idle.",
        "Example 2:\nInput: n = 2, m = 3, skills = [[0,1,2],[0,1,2]]\nOutput: 2\nExplanation: Only two workers exist, so at most two tasks can be covered.",
        "Constraints:\n- 1 <= n, m <= 500\n- Total number of qualification pairs <= 10^5\n- Values in skills[i] are in the range 0 to m-1",
      ],
      code: `int maxTasksAssigned(int n, int m, vector<vector<int>>& skills) {
    vector<int> taskOwner(m, -1);
    vector<char> used(m, 0);
    function<bool(int)> assign = [&](int w) -> bool {
        for (int t : skills[w]) {
            if (used[t]) continue;
            used[t] = 1;
            if (taskOwner[t] == -1 || assign(taskOwner[t])) {
                taskOwner[t] = w;
                return true;
            }
        }
        return false;
    };
    int assigned = 0;
    for (int w = 0; w < n; w++) {
        fill(used.begin(), used.end(), 0);
        if (assign(w)) assigned++;
    }
    return assigned;
}`,
      explanation: [
        "This is maximum bipartite matching in its plainest form: workers on one side, tasks on the other, an edge for every qualification. The answer is capped by min(n, m) and by the structure of the skill lists.",
        "The recursion is the important part. When worker w wants task t and t is already owned by worker x, the algorithm asks x to move to some other task. If x succeeds, both w and x end up assigned, so the total grows by one; if x fails, t stays with x and w tries its next task. That is exactly one augmenting path search.",
        "Time: O(V * E). Space: O(m).",
      ],
    },
    {
      name: "Assign Courses to Students with Seat Limits",
      difficulty: "Medium",
      variation: "Capacitated matching",
      question: [
        "There are n students and m courses. Student i is willing to take any one of the courses listed in wish[i]. Course j has cap[j] seats. Each student can be enrolled in at most one course, and course j can hold at most cap[j] students. Return the maximum number of students that can be enrolled.",
        "Example 1:\nInput: n = 5, m = 2, wish = [[0],[0],[0,1],[1],[1]], cap = [2,2]\nOutput: 4\nExplanation: Students 0 and 1 take course 0, students 3 and 4 take course 1. Student 2 finds both courses full.",
        "Example 2:\nInput: n = 3, m = 1, wish = [[0],[0],[0]], cap = [3]\nOutput: 3",
        "Constraints:\n- 1 <= n <= 1000\n- 1 <= m <= 200\n- 1 <= cap[j] <= n\n- Total number of wishes <= 10^5",
      ],
      code: `struct CapacitatedMatch {
    int n, m;
    vector<vector<int>> adj;
    vector<int> cap;
    vector<vector<int>> taken;
    vector<char> used;
    CapacitatedMatch(int n, int m, vector<vector<int>> adj, vector<int> cap)
        : n(n), m(m), adj(move(adj)), cap(move(cap)), taken(m), used(m, 0) {}
    bool tryAssign(int u) {
        for (int c : adj[u]) {
            if (used[c]) continue;
            used[c] = 1;
            if ((int)taken[c].size() < cap[c]) {
                taken[c].push_back(u);
                return true;
            }
            for (int i = 0; i < (int)taken[c].size(); i++) {
                int w = taken[c][i];
                if (tryAssign(w)) {
                    taken[c][i] = u;
                    return true;
                }
            }
        }
        return false;
    }
    int solve() {
        int enrolled = 0;
        for (int u = 0; u < n; u++) {
            fill(used.begin(), used.end(), 0);
            if (tryAssign(u)) enrolled++;
        }
        return enrolled;
    }
};

int maxEnrolled(int n, int m, vector<vector<int>>& wish, vector<int>& cap) {
    CapacitatedMatch solver(n, m, wish, cap);
    return solver.solve();
}`,
      explanation: [
        "Conceptually each course is split into cap[j] identical seats, turning the problem back into ordinary bipartite matching. Building those seats explicitly works but wastes memory when capacities are large, so the code keeps one list of current occupants per course instead.",
        "The augmenting step generalises cleanly: if a course still has a free seat the student sits down immediately; otherwise the algorithm asks each current occupant to relocate, and the first one that succeeds frees its slot. Marking used[c] before recursing guarantees the same course is never re-entered inside a single search, so the occupant list is stable while it is being scanned.",
        "This is the standard bridge from matching to flow: capacities on one side are exactly what a max-flow model would express with capacity cap[j] on the course-to-sink edge.",
        "Time: O(V * E) with the same augmenting-path bound. Space: O(n + m).",
      ],
    },
    {
      name: "School Dance",
      difficulty: "Medium",
      variation: "Kuhn's with pair reconstruction",
      link: "https://cses.fi/problemset/task/1696",
      question: [
        "There are n boys and m girls at a school dance. You are given k pairs (a, b) meaning boy a and girl b are willing to dance together. Your task is to find the maximum number of dance pairs that can be formed at the same time, where each person dances with at most one partner, and to print one optimal set of pairs.",
        "Example 1:\nInput: n = 3, m = 2, k = 3, pairs = [(1,1),(1,2),(2,1)]\nOutput: 2\n1 2\n2 1\nExplanation: Boy 1 dances with girl 2 and boy 2 dances with girl 1. Boy 3 has no willing partner.",
        "Constraints:\n- 1 <= n, m <= 500\n- 1 <= k <= 1000\n- 1 <= a <= n, 1 <= b <= m\n- People are numbered starting from 1",
      ],
      code: `int main() {
    int n, m, k;
    scanf("%d %d %d", &n, &m, &k);
    vector<vector<int>> adj(n);
    for (int i = 0; i < k; i++) {
        int a, b;
        scanf("%d %d", &a, &b);
        adj[a - 1].push_back(b - 1);
    }
    vector<int> matchGirl(m, -1);
    vector<char> used(m, 0);
    function<bool(int)> tryKuhn = [&](int u) -> bool {
        for (int v : adj[u]) {
            if (used[v]) continue;
            used[v] = 1;
            if (matchGirl[v] == -1 || tryKuhn(matchGirl[v])) {
                matchGirl[v] = u;
                return true;
            }
        }
        return false;
    };
    int total = 0;
    for (int u = 0; u < n; u++) {
        fill(used.begin(), used.end(), 0);
        if (tryKuhn(u)) total++;
    }
    printf("%d\\n", total);
    for (int v = 0; v < m; v++) {
        if (matchGirl[v] != -1) printf("%d %d\\n", matchGirl[v] + 1, v + 1);
    }
    return 0;
}`,
      explanation: [
        "The willingness pairs form a bipartite graph with boys on the left and girls on the right, so the maximum number of simultaneous dance pairs is the maximum matching.",
        "Because the problem also asks for the pairs themselves, the matchGirl array is kept as the answer rather than just a counter. Scanning it once at the end prints every matched edge exactly once, since each girl appears in at most one pair.",
        "With n, m <= 500 and k <= 1000 the graph is sparse, so Kuhn's O(V * E) bound is comfortably fast. Hopcroft-Karp would also work and is what you reach for when the edge count grows into the hundreds of thousands.",
        "Time: O(V * E). Space: O(V + E).",
      ],
    },
    {
      name: "Maximum Non-Attacking Rooks on a Board with Blocked Cells",
      difficulty: "Medium",
      variation: "Rows-to-columns matching",
      question: [
        "You are given an n x m chessboard as an array of strings, where a dot means the cell is free and a hash means the cell is blocked. Place as many rooks as possible on free cells so that no two rooks share a row and no two rooks share a column. Return the maximum number of rooks.",
        "Example 1:\nInput: board = [\"..#\",\"..#\",\"..#\"]\nOutput: 2\nExplanation: Every row has free cells only in columns 0 and 1, so only two columns are available and at most two rooks fit.",
        "Example 2:\nInput: board = [\"...\",\"...\",\"...\"]\nOutput: 3\nExplanation: The main diagonal works.",
        "Constraints:\n- 1 <= n, m <= 300\n- board[i][j] is either a dot or a hash",
      ],
      code: `int maxRooks(vector<string>& board) {
    int n = board.size(), m = board[0].size();
    vector<vector<int>> adj(n);
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            if (board[i][j] == '.') adj[i].push_back(j);
        }
    }
    vector<int> matchCol(m, -1);
    vector<char> used(m, 0);
    function<bool(int)> tryKuhn = [&](int r) -> bool {
        for (int c : adj[r]) {
            if (used[c]) continue;
            used[c] = 1;
            if (matchCol[c] == -1 || tryKuhn(matchCol[c])) {
                matchCol[c] = r;
                return true;
            }
        }
        return false;
    };
    int rooks = 0;
    for (int r = 0; r < n; r++) {
        fill(used.begin(), used.end(), 0);
        if (tryKuhn(r)) rooks++;
    }
    return rooks;
}`,
      explanation: [
        "Since no two rooks may share a row or a column, every rook uses up one row and one column. Model rows as the left side, columns as the right side, and add an edge (i, j) whenever cell (i, j) is free. A legal rook placement is precisely a matching, and the largest placement is the maximum matching.",
        "The reduction is exact in both directions: any matching converts back to a placement by putting a rook on each matched cell, so no rook count is lost or gained by the translation.",
        "Note that rooks here attack along whole rows and columns regardless of blocked cells. If blocked cells were allowed to shield rooks from each other, the row-and-column model breaks and each maximal free segment becomes its own left or right node instead.",
        "Time: O(n * n * m) in the worst case. Space: O(n * m) for the adjacency lists.",
      ],
    },
    {
      name: "Coin Grid - Minimum Lines to Remove All Coins",
      difficulty: "Hard",
      variation: "König duality",
      question: [
        "You are given an n x n grid as an array of strings, where the letter o marks a square containing a coin and a dot marks an empty square. In one move you choose a whole row or a whole column and remove every coin in it. Return the minimum number of moves needed to remove all coins from the grid.",
        "Example 1:\nInput: grid = [\"o..o\",\"..o.\",\"..o.\",\"o..o\"]\nOutput: 3\nExplanation: Remove column 0, column 3, and column 2. Rows would need four moves.",
        "Example 2:\nInput: grid = [\"oo\",\"oo\"]\nOutput: 2\nExplanation: Two rows, or two columns, clear the board.",
        "Constraints:\n- 1 <= n <= 300\n- grid[i][j] is either the letter o or a dot",
      ],
      code: `int minLinesToRemoveCoins(vector<string>& grid) {
    int n = grid.size(), m = grid[0].size();
    vector<vector<int>> adj(n);
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            if (grid[i][j] == 'o') adj[i].push_back(j);
        }
    }
    vector<int> matchCol(m, -1);
    vector<char> used(m, 0);
    function<bool(int)> tryKuhn = [&](int r) -> bool {
        for (int c : adj[r]) {
            if (used[c]) continue;
            used[c] = 1;
            if (matchCol[c] == -1 || tryKuhn(matchCol[c])) {
                matchCol[c] = r;
                return true;
            }
        }
        return false;
    };
    int matching = 0;
    for (int r = 0; r < n; r++) {
        fill(used.begin(), used.end(), 0);
        if (tryKuhn(r)) matching++;
    }
    return matching;
}`,
      explanation: [
        "Treat every coin as an edge between its row and its column in a bipartite graph. Choosing a set of rows and columns that covers all coins is choosing a set of vertices touching every edge, which is exactly a minimum vertex cover.",
        "König's theorem states that in a bipartite graph the size of a minimum vertex cover equals the size of a maximum matching. So the answer is the maximum matching size, and no separate cover search is needed for the count.",
        "The intuition for why the two agree: every matching edge needs its own distinct cover vertex, giving cover >= matching, and the alternating-path construction turns any maximum matching into a cover of the same size, giving cover <= matching.",
        "Time: O(V * E). Space: O(n * m) for the adjacency lists.",
      ],
    },
    {
      name: "Minimum Vertex Cover in a Bipartite Graph",
      difficulty: "Hard",
      variation: "König duality with construction",
      question: [
        "You are given a bipartite graph with n left nodes and m right nodes, described by an adjacency list adj where adj[u] lists the right-side neighbours of left node u. A vertex cover is a set of nodes such that every edge has at least one endpoint in the set. Return one minimum vertex cover as a pair of lists: the chosen left nodes and the chosen right nodes.",
        "Example 1:\nInput: n = 3, m = 3, adj = [[0,1,2],[0],[0]]\nOutput: left = [0], right = [0]\nExplanation: Left node 0 covers its three edges and right node 0 covers the edges from left 1 and left 2. Two nodes are needed because the matching (0,1) and (1,0) has size 2.",
        "Example 2:\nInput: n = 2, m = 2, adj = [[0],[1]]\nOutput: left = [0,1], right = []\nExplanation: The two disjoint edges force two cover nodes.",
        "Constraints:\n- 1 <= n, m <= 500\n- Total number of edges <= 10^5",
      ],
      code: `pair<vector<int>, vector<int>> minVertexCover(int n, int m, vector<vector<int>>& adj) {
    vector<int> matchL(n, -1), matchR(m, -1);
    vector<char> used(m, 0);
    function<bool(int)> tryKuhn = [&](int u) -> bool {
        for (int v : adj[u]) {
            if (used[v]) continue;
            used[v] = 1;
            if (matchR[v] == -1 || tryKuhn(matchR[v])) {
                matchR[v] = u;
                matchL[u] = v;
                return true;
            }
        }
        return false;
    };
    for (int u = 0; u < n; u++) {
        fill(used.begin(), used.end(), 0);
        tryKuhn(u);
    }
    vector<char> visL(n, 0), visR(m, 0);
    function<void(int)> walk = [&](int u) {
        visL[u] = 1;
        for (int v : adj[u]) {
            if (v == matchL[u] || visR[v]) continue;
            visR[v] = 1;
            int w = matchR[v];
            if (w != -1 && !visL[w]) walk(w);
        }
    };
    for (int u = 0; u < n; u++) {
        if (matchL[u] == -1) walk(u);
    }
    vector<int> coverLeft, coverRight;
    for (int u = 0; u < n; u++) {
        if (!visL[u]) coverLeft.push_back(u);
    }
    for (int v = 0; v < m; v++) {
        if (visR[v]) coverRight.push_back(v);
    }
    return {coverLeft, coverRight};
}`,
      explanation: [
        "First compute a maximum matching. König's theorem promises a cover of exactly that size, and the proof is constructive, which is what the second half of the code implements.",
        "Let Z be the set of nodes reachable from unmatched left nodes by alternating paths: unmatched edges going left to right, matched edges going right to left. The minimum vertex cover is the left nodes outside Z together with the right nodes inside Z.",
        "Why it covers everything: an edge with its left endpoint in Z either is the matched edge of that endpoint, in which case the right endpoint is also in Z, or is unmatched, in which case the walk would have entered the right endpoint, again putting it in Z. Edges whose left endpoint is outside Z are covered by that left endpoint. Why it is minimum: every left node outside Z is matched (unmatched ones start the walk, so they are in Z), every right node inside Z is matched (an unmatched one would mean an augmenting path exists), and no matching edge is counted twice, so the cover size equals the matching size.",
        "Time: O(V * E) for the matching plus O(V + E) for the construction. Space: O(V).",
      ],
    },
    {
      name: "Maximum Independent Set in a Bipartite Graph",
      difficulty: "Hard",
      variation: "Complement of minimum vertex cover",
      question: [
        "You are given a bipartite graph with n left nodes and m right nodes, described by an adjacency list adj where adj[u] lists the right-side neighbours of left node u. An independent set is a set of nodes with no edge between any two of them. Return the size of a maximum independent set.",
        "Example 1:\nInput: n = 3, m = 3, adj = [[0,1,2],[0],[0]]\nOutput: 4\nExplanation: Maximum matching is 2, total nodes is 6, so the answer is 6 - 2 = 4. One such set is left nodes 1 and 2 plus right nodes 1 and 2.",
        "Example 2:\nInput: n = 2, m = 2, adj = [[],[]]\nOutput: 4\nExplanation: With no edges every node can be taken.",
        "Constraints:\n- 1 <= n, m <= 500\n- Total number of edges <= 10^5",
      ],
      code: `int maxIndependentSet(int n, int m, vector<vector<int>>& adj) {
    vector<int> matchR(m, -1);
    vector<char> used(m, 0);
    function<bool(int)> tryKuhn = [&](int u) -> bool {
        for (int v : adj[u]) {
            if (used[v]) continue;
            used[v] = 1;
            if (matchR[v] == -1 || tryKuhn(matchR[v])) {
                matchR[v] = u;
                return true;
            }
        }
        return false;
    };
    int matching = 0;
    for (int u = 0; u < n; u++) {
        fill(used.begin(), used.end(), 0);
        if (tryKuhn(u)) matching++;
    }
    return n + m - matching;
}`,
      explanation: [
        "The reduction is a two-step chain. A set of nodes is independent exactly when its complement is a vertex cover, because every edge must have an endpoint outside the independent set. Therefore maximum independent set equals total nodes minus minimum vertex cover.",
        "König's theorem then replaces minimum vertex cover with maximum matching in a bipartite graph, giving the closed formula n + m - matching. This is the Konig-Egervary form of the result, and it is the reason maximum independent set is easy on bipartite graphs while being NP-hard in general.",
        "To output the actual set rather than its size, build the minimum vertex cover with the alternating-reachability construction and take every node not in it.",
        "Time: O(V * E). Space: O(V).",
      ],
    },
    {
      name: "Minimum Path Cover of a DAG",
      difficulty: "Hard",
      variation: "Minimum path cover",
      question: [
        "You are given a directed acyclic graph with n nodes numbered 0 to n-1 and a list of directed edges. A path cover is a set of directed paths such that every node belongs to exactly one path; a single node with no edges counts as a path of length zero. Return the minimum number of paths needed to cover all nodes.",
        "Example 1:\nInput: n = 4, edges = [[0,1],[1,2],[2,3]]\nOutput: 1\nExplanation: The single path 0 to 1 to 2 to 3 covers everything.",
        "Example 2:\nInput: n = 4, edges = [[0,1],[0,2],[0,3]]\nOutput: 3\nExplanation: Node 0 can extend into only one of its successors, so the other two successors each start their own path.",
        "Constraints:\n- 1 <= n <= 500\n- 0 <= number of edges <= 10^5\n- The graph is acyclic and has no self loops",
      ],
      code: `int minPathCover(int n, vector<vector<int>>& edges) {
    vector<vector<int>> adj(n);
    for (auto& e : edges) adj[e[0]].push_back(e[1]);
    vector<int> matchIn(n, -1);
    vector<char> used(n, 0);
    function<bool(int)> tryKuhn = [&](int u) -> bool {
        for (int v : adj[u]) {
            if (used[v]) continue;
            used[v] = 1;
            if (matchIn[v] == -1 || tryKuhn(matchIn[v])) {
                matchIn[v] = u;
                return true;
            }
        }
        return false;
    };
    int matching = 0;
    for (int u = 0; u < n; u++) {
        fill(used.begin(), used.end(), 0);
        if (tryKuhn(u)) matching++;
    }
    return n - matching;
}`,
      explanation: [
        "State the reduction explicitly. Split every node v into an out-copy on the left and an in-copy on the right, and add a bipartite edge from out-copy u to in-copy v for every DAG edge u to v. Selecting a bipartite edge means using that DAG edge inside some path.",
        "In a vertex-disjoint path cover each node has at most one outgoing chosen edge and at most one incoming chosen edge, which is precisely the matching condition on the split graph. A set of chosen edges satisfying both degree limits forms disjoint chains, and because the graph is acyclic it cannot close into a cycle, so the chains really are paths.",
        "Counting: k disjoint paths covering n nodes use exactly n - k edges, so minimising the number of paths means maximising the number of chosen edges. Hence minimum path cover equals n minus the maximum matching.",
        "This computes the vertex-disjoint version. If paths are allowed to share nodes (the minimum path cover that only needs to touch every node), first replace the graph by its transitive closure, then apply the same formula.",
        "Time: O(V * E). Space: O(V + E).",
      ],
    },
    {
      name: "Maximum Domino Placement on a Board with Holes",
      difficulty: "Hard",
      variation: "Grid parity matching",
      question: [
        "You are given an n x m board as an array of strings, where a dot marks a free cell and a hash marks a hole. You want to place 1 x 2 dominoes on the board so that each domino covers two horizontally or vertically adjacent free cells and no cell is covered twice. Return the maximum number of dominoes that can be placed.",
        "Example 1:\nInput: board = [\"..#\",\"...\",\"#..\"]\nOutput: 3\nExplanation: Seven free cells allow at most three dominoes, and three can indeed be placed.",
        "Example 2:\nInput: board = [\".#.\",\"#.#\",\".#.\"]\nOutput: 0\nExplanation: No two free cells are adjacent.",
        "Constraints:\n- 1 <= n, m <= 50\n- board[i][j] is either a dot or a hash",
      ],
      code: `int maxDominoes(vector<string>& board) {
    int n = board.size(), m = board[0].size();
    vector<int> leftId(n * m, -1), rightId(n * m, -1);
    int leftCount = 0, rightCount = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            if (board[i][j] == '#') continue;
            if ((i + j) % 2 == 0) leftId[i * m + j] = leftCount++;
            else rightId[i * m + j] = rightCount++;
        }
    }
    vector<vector<int>> adj(leftCount);
    int di[4] = {1, -1, 0, 0};
    int dj[4] = {0, 0, 1, -1};
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            if (board[i][j] == '#' || (i + j) % 2 != 0) continue;
            for (int d = 0; d < 4; d++) {
                int ni = i + di[d], nj = j + dj[d];
                if (ni < 0 || nj < 0 || ni >= n || nj >= m) continue;
                if (board[ni][nj] == '#') continue;
                adj[leftId[i * m + j]].push_back(rightId[ni * m + nj]);
            }
        }
    }
    vector<int> matchRight(rightCount, -1);
    vector<char> used(rightCount, 0);
    function<bool(int)> tryKuhn = [&](int u) -> bool {
        for (int v : adj[u]) {
            if (used[v]) continue;
            used[v] = 1;
            if (matchRight[v] == -1 || tryKuhn(matchRight[v])) {
                matchRight[v] = u;
                return true;
            }
        }
        return false;
    };
    int placed = 0;
    for (int u = 0; u < leftCount; u++) {
        fill(used.begin(), used.end(), 0);
        if (tryKuhn(u)) placed++;
    }
    return placed;
}`,
      explanation: [
        "Colour the board like a chessboard by the parity of i + j. Any domino covers two adjacent cells, and adjacent cells always have opposite parity, so the grid graph is bipartite with the two colour classes as its sides. A set of non-overlapping dominoes is exactly a matching, and the maximum placement is the maximum matching.",
        "The code assigns compact indices to free even cells and free odd cells, then adds an edge for every adjacent free pair. Only even cells need to enumerate neighbours, since each domino is discovered once from its even end.",
        "A perfect tiling exists only when the matching saturates both sides, which additionally requires the two colour classes to have equal size. That equal-count check is a quick necessary test before running the matching at all.",
        "Time: O(V * E), which on a grid is O(n * m * n * m) in the worst case and fine for 50 x 50. Space: O(n * m).",
      ],
    },
    {
      name: "Perfect Matching Existence Check (Hall's Condition)",
      difficulty: "Hard",
      variation: "Hall's condition",
      question: [
        "You are given a bipartite graph with n left nodes and m right nodes (n <= m), described by an adjacency list adj where adj[u] lists the right-side neighbours of left node u. Decide whether every left node can be matched to a distinct right node. If it is impossible, also return a witness: a set S of left nodes whose combined neighbourhood is smaller than S itself.",
        "Example 1:\nInput: n = 2, m = 3, adj = [[0,1],[1,2]]\nOutput: true, witness = []\nExplanation: Match left 0 to right 0 and left 1 to right 1.",
        "Example 2:\nInput: n = 3, m = 3, adj = [[0,1],[0,1],[0,1]]\nOutput: false, witness = [0,1,2]\nExplanation: Three left nodes share only two possible partners, so Hall's condition fails.",
        "Constraints:\n- 1 <= n <= m <= 500\n- Total number of edges <= 10^5",
      ],
      code: `pair<bool, vector<int>> hasPerfectLeftMatching(int n, int m, vector<vector<int>>& adj) {
    vector<int> matchL(n, -1), matchR(m, -1);
    vector<char> used(m, 0);
    function<bool(int)> tryKuhn = [&](int u) -> bool {
        for (int v : adj[u]) {
            if (used[v]) continue;
            used[v] = 1;
            if (matchR[v] == -1 || tryKuhn(matchR[v])) {
                matchR[v] = u;
                matchL[u] = v;
                return true;
            }
        }
        return false;
    };
    int matching = 0;
    for (int u = 0; u < n; u++) {
        fill(used.begin(), used.end(), 0);
        if (tryKuhn(u)) matching++;
    }
    if (matching == n) return {true, vector<int>()};
    int bad = -1;
    for (int u = 0; u < n; u++) {
        if (matchL[u] == -1) { bad = u; break; }
    }
    vector<char> visL(n, 0), visR(m, 0);
    function<void(int)> walk = [&](int u) {
        visL[u] = 1;
        for (int v : adj[u]) {
            if (v == matchL[u] || visR[v]) continue;
            visR[v] = 1;
            int w = matchR[v];
            if (w != -1 && !visL[w]) walk(w);
        }
    };
    walk(bad);
    vector<int> witness;
    for (int u = 0; u < n; u++) {
        if (visL[u]) witness.push_back(u);
    }
    return {false, witness};
}`,
      explanation: [
        "Hall's marriage theorem says a matching saturating the left side exists if and only if every subset S of left nodes satisfies |N(S)| >= |S|, where N(S) is the union of their neighbourhoods. Checking all subsets is exponential, so the practical test is to compute a maximum matching and compare its size to n.",
        "When the matching falls short, an explicit Hall violator is recoverable from the failed search. Pick any unmatched left node and take S to be all left nodes reachable from it by alternating paths. Every right node adjacent to S is matched (otherwise there would be an augmenting path and the matching would not be maximum) and its partner is itself in S, so N(S) is exactly the set of partners of S minus the one unmatched node. That gives |N(S)| = |S| - 1.",
        "The witness is what makes an impossibility answer verifiable: a checker can confirm |N(S)| < |S| directly without trusting the matching algorithm.",
        "Time: O(V * E). Space: O(V).",
      ],
    },
    {
      name: "Hopcroft-Karp Maximum Matching",
      difficulty: "Hard",
      variation: "Hopcroft-Karp",
      question: [
        "You are given a bipartite graph with n left nodes and m right nodes and a list of edges, where each edge is a pair (u, v) with u a left node and v a right node. The graph is large: up to 10^5 nodes per side and up to 10^6 edges. Return the size of a maximum matching, using an algorithm fast enough for these limits.",
        "Example 1:\nInput: n = 4, m = 4, edges = [(0,0),(0,1),(1,0),(2,2),(3,2),(3,3)]\nOutput: 4\nExplanation: Match 0-1, 1-0, 2-2, 3-3.",
        "Example 2:\nInput: n = 3, m = 2, edges = [(0,0),(1,0),(2,1)]\nOutput: 2",
        "Constraints:\n- 1 <= n, m <= 10^5\n- 1 <= number of edges <= 10^6\n- No duplicate edges",
      ],
      code: `struct HopcroftKarp {
    int n, m;
    vector<vector<int>> adj;
    vector<int> matchL, matchR, dist;
    HopcroftKarp(int n, int m)
        : n(n), m(m), adj(n), matchL(n, -1), matchR(m, -1), dist(n, -1) {}
    void addEdge(int u, int v) { adj[u].push_back(v); }
    bool bfs() {
        queue<int> q;
        bool foundFree = false;
        for (int u = 0; u < n; u++) {
            if (matchL[u] == -1) {
                dist[u] = 0;
                q.push(u);
            } else {
                dist[u] = -1;
            }
        }
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int v : adj[u]) {
                int w = matchR[v];
                if (w == -1) {
                    foundFree = true;
                } else if (dist[w] == -1) {
                    dist[w] = dist[u] + 1;
                    q.push(w);
                }
            }
        }
        return foundFree;
    }
    bool dfs(int u) {
        for (int v : adj[u]) {
            int w = matchR[v];
            if (w == -1 || (dist[w] == dist[u] + 1 && dfs(w))) {
                matchL[u] = v;
                matchR[v] = u;
                return true;
            }
        }
        dist[u] = -1;
        return false;
    }
    int maxMatching() {
        int result = 0;
        while (bfs()) {
            for (int u = 0; u < n; u++) {
                if (matchL[u] == -1 && dfs(u)) result++;
            }
        }
        return result;
    }
};

int solve(int n, int m, vector<pair<int, int>>& edges) {
    HopcroftKarp hk(n, m);
    for (auto& e : edges) hk.addEdge(e.first, e.second);
    return hk.maxMatching();
}`,
      explanation: [
        "Kuhn's algorithm finds one augmenting path per search, costing O(V * E) overall. Hopcroft-Karp instead finds a maximal set of shortest, vertex-disjoint augmenting paths per phase, which cuts the number of phases to O(sqrt(V)).",
        "Each phase has two parts. The BFS layers the left nodes by their alternating distance from the free left nodes, and reports whether any free right node is reachable at all. The DFS then greedily pulls out augmenting paths that strictly follow those layers, so the paths it finds are all of the current shortest length and are vertex-disjoint because dist[u] is reset to -1 once a node fails or is consumed.",
        "Correctness still rests on Berge's theorem: the loop stops exactly when the BFS can no longer reach a free right node, meaning no augmenting path remains, so the matching is maximum. The speedup comes from the classic bound that the shortest augmenting path length strictly increases each phase, and after sqrt(V) phases at most sqrt(V) augmentations remain.",
        "Time: O(E * sqrt(V)). Space: O(V + E).",
      ],
    },
    {
      name: "Stable Marriage (Gale-Shapley)",
      difficulty: "Hard",
      variation: "Gale-Shapley (not a matching-size problem)",
      question: [
        "There are n men and n women. You are given menPref, where menPref[i] is a permutation of 0 to n-1 listing man i's preferences from most to least preferred woman, and womenPref, where womenPref[j] is a permutation listing woman j's preferences over men. Find a perfect pairing that is stable: there must be no man and woman who both prefer each other over their assigned partners. Return an array wife where wife[i] is the woman paired with man i.",
        "Example 1:\nInput: n = 2, menPref = [[0,1],[0,1]], womenPref = [[1,0],[0,1]]\nOutput: wife = [1,0]\nExplanation: Both men prefer woman 0, but woman 0 prefers man 1, so man 1 gets woman 0 and man 0 gets woman 1. No blocking pair exists.",
        "Example 2:\nInput: n = 1, menPref = [[0]], womenPref = [[0]]\nOutput: wife = [0]",
        "Constraints:\n- 1 <= n <= 2000\n- menPref[i] and womenPref[j] are permutations of 0 to n-1",
      ],
      code: `vector<int> stableMarriage(int n, vector<vector<int>>& menPref,
                          vector<vector<int>>& womenPref) {
    vector<vector<int>> rankOfMan(n, vector<int>(n, 0));
    for (int w = 0; w < n; w++) {
        for (int r = 0; r < n; r++) rankOfMan[w][womenPref[w][r]] = r;
    }
    vector<int> nextChoice(n, 0), husband(n, -1), wife(n, -1);
    queue<int> freeMen;
    for (int man = 0; man < n; man++) freeMen.push(man);
    while (!freeMen.empty()) {
        int man = freeMen.front();
        freeMen.pop();
        while (nextChoice[man] < n) {
            int w = menPref[man][nextChoice[man]++];
            if (husband[w] == -1) {
                husband[w] = man;
                wife[man] = w;
                break;
            }
            if (rankOfMan[w][man] < rankOfMan[w][husband[w]]) {
                int dumped = husband[w];
                wife[dumped] = -1;
                freeMen.push(dumped);
                husband[w] = man;
                wife[man] = w;
                break;
            }
        }
    }
    return wife;
}`,
      explanation: [
        "This is a different problem from maximum bipartite matching and should not be solved with Kuhn's algorithm. Here the graph is complete, so a perfect matching always exists trivially; the difficulty is the preference structure, and the objective is stability rather than size. Conversely, maximum matching has no notion of preference and cares only about how many pairs fit.",
        "Gale-Shapley proceeds in proposals. Each free man proposes to the best woman he has not yet asked. A free woman always accepts; an engaged woman accepts only if she ranks the proposer above her current partner, in which case the old partner becomes free again. The rankOfMan table converts a preference list into O(1) comparisons.",
        "Termination and stability: a man never proposes to the same woman twice, so there are at most n * n proposals. Once engaged, a woman only ever trades up. Suppose man x and woman y both preferred each other to their partners. Then x must have proposed to y at some point, since he works down his list and y ranks above his final partner. Y either accepted and later traded up, or rejected him for someone better, so in both cases her final partner outranks x, contradicting the assumption. The algorithm yields the man-optimal stable matching; swapping the roles yields the woman-optimal one.",
        "Time: O(n * n). Space: O(n * n) for the rank table.",
      ],
    },
  ],
};
