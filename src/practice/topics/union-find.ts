import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Number of Provinces",
      difficulty: "Medium",
      variation: "Basic DSU connectivity",
      link: "https://leetcode.com/problems/number-of-provinces/",
      question: [
        "There are n cities. Some of them are connected directly or indirectly. A province is a group of directly or indirectly connected cities and no other cities outside the group. You are given an n x n matrix isConnected where isConnected[i][j] = 1 if the i-th city and the j-th city are directly connected, and isConnected[i][j] = 0 otherwise. Return the total number of provinces.",
        "Example 1:\nInput: isConnected = [[1,1,0],[1,1,0],[0,0,1]]\nOutput: 2\nExplanation: Cities 0 and 1 form one province, city 2 forms another.",
        "Example 2:\nInput: isConnected = [[1,0,0],[0,1,0],[0,0,1]]\nOutput: 3",
        "Constraints:\n- 1 <= n <= 200\n- n == isConnected.length == isConnected[i].length\n- isConnected[i][j] is 1 or 0\n- isConnected[i][i] == 1 and isConnected[i][j] == isConnected[j][i]",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

int findCircleNum(vector<vector<int>>& isConnected) {
    int n = isConnected.size();
    DSU dsu(n);
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (isConnected[i][j]) dsu.unite(i, j);
    return dsu.components;
}`,
      explanation: [
        "Every edge merges the two endpoints' sets. The number of surviving roots is the number of provinces, tracked incrementally as a counter that drops by one on each successful union, so no final scan is needed.",
        "Path halving inside find (parent[x] = parent[parent[x]]) plus union by size keeps every operation at inverse-Ackermann amortized cost, which is effectively constant for any n that fits in memory.",
        "Time: O(n^2 * alpha(n)). Space: O(n).",
      ],
    },
    {
      name: "Number of Operations to Make Network Connected",
      difficulty: "Medium",
      variation: "Components counting, cable budget",
      link: "https://leetcode.com/problems/number-of-operations-to-make-network-connected/",
      question: [
        "There are n computers numbered from 0 to n - 1 connected by ethernet cables, given as connections[i] = [a, b] meaning computers a and b are directly connected. Any computer can reach any other computer through the network. You may remove any cable and place it between any pair of disconnected computers. Return the minimum number of such operations to make all computers connected, or -1 if it is impossible.",
        "Example 1:\nInput: n = 4, connections = [[0,1],[0,2],[1,2]]\nOutput: 1\nExplanation: Move the cable between 1 and 2 to connect computer 3.",
        "Example 2:\nInput: n = 6, connections = [[0,1],[0,2],[0,3],[1,2]]\nOutput: 2",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= connections.length <= min(n * (n - 1) / 2, 10^5)\n- connections[i].length == 2\n- 0 <= a, b < n and a != b\n- No repeated connections",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

int makeConnected(int n, vector<vector<int>>& connections) {
    if ((int)connections.size() < n - 1) return -1;
    DSU dsu(n);
    for (auto& e : connections) dsu.unite(e[0], e[1]);
    return dsu.components - 1;
}`,
      explanation: [
        "Connecting n nodes requires at least n - 1 cables, so if fewer cables exist the answer is -1 immediately. Otherwise there are always enough redundant cables to reuse.",
        "Each union that fails (both endpoints already share a root) marks a redundant cable, and each such cable can be moved to join two components. With c components, exactly c - 1 moves are needed, and the redundancy count is guaranteed to be at least c - 1 once the cable-count check passes.",
        "Time: O(m * alpha(n)) where m is the number of connections. Space: O(n).",
      ],
    },
    {
      name: "Redundant Connection",
      difficulty: "Medium",
      variation: "Cycle detection with DSU",
      link: "https://leetcode.com/problems/redundant-connection/",
      question: [
        "You are given a graph that started as a tree with n nodes labeled from 1 to n, with one additional edge added. The added edge connects two different existing vertices and is not already present. The graph is given as an array edges of length n where edges[i] = [ai, bi]. Return the edge that can be removed so that the resulting graph is a tree of n nodes. If there are multiple answers, return the one that occurs last in the input.",
        "Example 1:\nInput: edges = [[1,2],[1,3],[2,3]]\nOutput: [2,3]",
        "Example 2:\nInput: edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]\nOutput: [1,4]",
        "Constraints:\n- n == edges.length\n- 3 <= n <= 1000\n- edges[i].length == 2\n- 1 <= ai < bi <= edges.length\n- No repeated edges and the given graph is connected",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

vector<int> findRedundantConnection(vector<vector<int>>& edges) {
    int n = edges.size();
    DSU dsu(n + 1);
    for (auto& e : edges)
        if (!dsu.unite(e[0], e[1])) return e;
    return {};
}`,
      explanation: [
        "Scan the edges in the order given and union each pair. The first edge whose endpoints already share a root closes a cycle, so it is the extra edge.",
        "Because exactly one edge was added to a tree, exactly one union fails during the whole scan. Processing in input order means the failing edge is automatically the last-occurring valid answer.",
        "Time: O(n * alpha(n)). Space: O(n).",
      ],
    },
    {
      name: "Longest Consecutive Sequence",
      difficulty: "Medium",
      variation: "DSU over value successors",
      link: "https://leetcode.com/problems/longest-consecutive-sequence/",
      question: [
        "Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence. The sequence does not need to be contiguous in the array. Solve it with Union-Find rather than the hash-set sweep.",
        "Example 1:\nInput: nums = [100,4,200,1,3,2]\nOutput: 4\nExplanation: The longest consecutive sequence is [1,2,3,4].",
        "Example 2:\nInput: nums = [0,3,7,2,5,8,4,6,0,1]\nOutput: 9",
        "Constraints:\n- 0 <= nums.length <= 10^5\n- -10^9 <= nums[i] <= 10^9",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

int longestConsecutive(vector<int>& nums) {
    if (nums.empty()) return 0;
    unordered_map<int, int> id;
    vector<int> vals;
    for (int x : nums) {
        if (id.find(x) == id.end()) {
            int k = vals.size();
            id[x] = k;
            vals.push_back(x);
        }
    }
    int m = vals.size();
    DSU dsu(m);
    for (int i = 0; i < m; i++) {
        auto it = id.find(vals[i] + 1);
        if (it != id.end()) dsu.unite(i, it->second);
    }
    int best = 0;
    for (int i = 0; i < m; i++) best = max(best, dsu.size[dsu.find(i)]);
    return best;
}`,
      explanation: [
        "Deduplicate the values first and give each distinct value an index. Duplicates must be collapsed, otherwise two copies of the same number would both be merged into the run and inflate the component size.",
        "For every value v, union it with v + 1 when that value exists. A maximal run of consecutive integers becomes exactly one DSU component, so the answer is the largest component size, which union by size already maintains at each root.",
        "Time: O(n) expected, dominated by the hash map. Space: O(n).",
      ],
    },
    {
      name: "Satisfiability of Equality Equations",
      difficulty: "Medium",
      variation: "DSU over equality constraints",
      link: "https://leetcode.com/problems/satisfiability-of-equality-equations/",
      question: [
        "You are given an array of strings equations that represent relationships between variables where each string is of length 4 and takes one of two forms: \"xi==yi\" or \"xi!=yi\", with xi and yi lowercase letters representing single-letter variable names. Return true if it is possible to assign integers to variable names so as to satisfy all the given equations, or false otherwise.",
        "Example 1:\nInput: equations = [\"a==b\",\"b!=a\"]\nOutput: false",
        "Example 2:\nInput: equations = [\"a==b\",\"b==c\",\"a==c\"]\nOutput: true",
        "Constraints:\n- 1 <= equations.length <= 500\n- equations[i].length == 4\n- equations[i][0] and equations[i][3] are lowercase letters\n- equations[i][1] is either '=' or '!'\n- equations[i][2] is '='",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

bool equationsPossible(vector<string>& equations) {
    DSU dsu(26);
    for (auto& e : equations)
        if (e[1] == '=') dsu.unite(e[0] - 'a', e[3] - 'a');
    for (auto& e : equations)
        if (e[1] == '!' && dsu.find(e[0] - 'a') == dsu.find(e[3] - 'a')) return false;
    return true;
}`,
      explanation: [
        "Equality is reflexive, symmetric and transitive, which is exactly what a DSU component models. Process all equalities first so each component becomes one equivalence class of variables that must share a value.",
        "Only then check the inequalities: an inequality is violated precisely when its two variables landed in the same class. If no inequality is violated, assigning a distinct integer per component satisfies everything simultaneously.",
        "Time: O(m * alpha(26)) for m equations. Space: O(1) - the DSU has a fixed 26 slots.",
      ],
    },
    {
      name: "Smallest String With Swaps",
      difficulty: "Medium",
      variation: "DSU components, sort within group",
      link: "https://leetcode.com/problems/smallest-string-with-swaps/",
      question: [
        "You are given a string s and an array of pairs of indices pairs where pairs[i] = [a, b] indicates that you may swap the characters at indices a and b of s. You can swap any pair any number of times. Return the lexicographically smallest string that s can be changed to after using the swaps.",
        "Example 1:\nInput: s = \"dcab\", pairs = [[0,3],[1,2]]\nOutput: \"bacd\"",
        "Example 2:\nInput: s = \"dcab\", pairs = [[0,3],[1,2],[0,2]]\nOutput: \"abcd\"\nExplanation: Indices 0, 2 and 3 are all mutually swappable.",
        "Constraints:\n- 1 <= s.length <= 10^5\n- 0 <= pairs.length <= 10^5\n- 0 <= pairs[i][0], pairs[i][1] < s.length\n- s only contains lowercase English letters",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

string smallestStringWithSwaps(string s, vector<vector<int>>& pairs) {
    int n = s.size();
    DSU dsu(n);
    for (auto& p : pairs) dsu.unite(p[0], p[1]);
    unordered_map<int, vector<char>> groups;
    for (int i = 0; i < n; i++) groups[dsu.find(i)].push_back(s[i]);
    for (auto& kv : groups)
        sort(kv.second.rbegin(), kv.second.rend());
    string res;
    res.reserve(n);
    for (int i = 0; i < n; i++) {
        vector<char>& g = groups[dsu.find(i)];
        res.push_back(g.back());
        g.pop_back();
    }
    return res;
}`,
      explanation: [
        "Swaps are transitive: if 0 can swap with 3 and 3 with 2, then any permutation of positions {0, 2, 3} is reachable. So each DSU component of indices can be rearranged completely freely.",
        "Collect the characters of each component, sort them descending so the smallest sits at the back of the vector, then walk the string left to right and pop the smallest remaining character of that index's component. Greedily placing the smallest available character at the earliest position gives the lexicographic minimum.",
        "Time: O(n log n + p * alpha(n)). Space: O(n).",
      ],
    },
    {
      name: "Accounts Merge",
      difficulty: "Medium",
      variation: "DSU keyed by external attribute",
      link: "https://leetcode.com/problems/accounts-merge/",
      question: [
        "You are given a list accounts where accounts[i][0] is a name and the rest of accounts[i] are emails. Two accounts definitely belong to the same person if there is some common email. A person can have any number of accounts, but all their accounts have the same name. Merge the accounts and return them; the first element of each merged account is the name and the rest are emails in sorted order.",
        "Example 1:\nInput: accounts = [[\"John\",\"a@m.co\",\"b@m.co\"],[\"John\",\"c@m.co\"],[\"John\",\"a@m.co\",\"d@m.co\"],[\"Mary\",\"e@m.co\"]]\nOutput: [[\"John\",\"a@m.co\",\"b@m.co\",\"d@m.co\"],[\"John\",\"c@m.co\"],[\"Mary\",\"e@m.co\"]]\nExplanation: The first and third accounts share a@m.co, so they merge.",
        "Constraints:\n- 1 <= accounts.length <= 1000\n- 2 <= accounts[i].length <= 10\n- 1 <= accounts[i][j].length <= 30\n- accounts[i][0] consists of English letters\n- accounts[i][j] for j > 0 is a valid email",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

vector<vector<string>> accountsMerge(vector<vector<string>>& accounts) {
    int n = accounts.size();
    DSU dsu(n);
    unordered_map<string, int> owner;
    for (int i = 0; i < n; i++) {
        for (int j = 1; j < (int)accounts[i].size(); j++) {
            const string& mail = accounts[i][j];
            auto it = owner.find(mail);
            if (it == owner.end()) owner[mail] = i;
            else dsu.unite(i, it->second);
        }
    }
    unordered_map<int, set<string>> merged;
    for (auto& kv : owner) merged[dsu.find(kv.second)].insert(kv.first);
    vector<vector<string>> res;
    for (auto& kv : merged) {
        vector<string> row;
        row.push_back(accounts[kv.first][0]);
        row.insert(row.end(), kv.second.begin(), kv.second.end());
        res.push_back(row);
    }
    return res;
}`,
      explanation: [
        "The DSU nodes are account indices, not emails. Keep a map from each email to the first account index that claimed it; when a later account repeats that email, union the two account indices.",
        "After all unions, every component is one real person. Regrouping the email map by component root and inserting into a std::set produces the sorted email list, and the name can be read from any member account since all accounts of a person share a name.",
        "Time: O(E log E) where E is the total number of emails, dominated by the set insertions. Space: O(E).",
      ],
    },
    {
      name: "Most Stones Removed with Same Row or Column",
      difficulty: "Medium",
      variation: "DSU on rows and columns as nodes",
      link: "https://leetcode.com/problems/most-stones-removed-with-same-row-or-column/",
      question: [
        "On a 2D plane, some stones are placed at integer coordinates. A stone can be removed if it shares either the same row or the same column as another stone that has not been removed. Given an array stones of length n where stones[i] = [xi, yi], return the largest possible number of stones that can be removed.",
        "Example 1:\nInput: stones = [[0,0],[0,1],[1,0],[1,2],[2,1],[2,2]]\nOutput: 5\nExplanation: All six stones are in one connected group, so five can be removed.",
        "Example 2:\nInput: stones = [[0,0],[0,2],[1,1],[2,0],[2,2]]\nOutput: 3",
        "Constraints:\n- 1 <= stones.length <= 1000\n- 0 <= xi, yi <= 10^4\n- No two stones are at the same coordinate point",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

int removeStones(vector<vector<int>>& stones) {
    const int OFFSET = 10001;
    int n = stones.size();
    DSU dsu(2 * OFFSET);
    unordered_set<int> used;
    for (auto& s : stones) {
        int r = s[0], c = s[1] + OFFSET;
        dsu.unite(r, c);
        used.insert(r);
        used.insert(c);
    }
    unordered_set<int> roots;
    for (int x : used) roots.insert(dsu.find(x));
    return n - (int)roots.size();
}`,
      explanation: [
        "Model each row index and each column index as a DSU node (columns shifted by an offset so they never collide with rows). A stone at (r, c) is an edge joining row r to column c.",
        "Within one connected group of stones, removals can proceed in reverse order of a spanning tree's construction, so all but one stone can always be removed. The answer is therefore n minus the number of connected groups, and the number of groups equals the number of distinct roots among the row and column nodes that actually appear.",
        "Time: O(n * alpha(n)). Space: O(maxCoord).",
      ],
    },
    {
      name: "Regions Cut By Slashes",
      difficulty: "Medium",
      variation: "DSU on cell sub-triangles",
      link: "https://leetcode.com/problems/regions-cut-by-slashes/",
      question: [
        "An n x n grid is composed of 1 x 1 squares where each square consists of a '/', a backslash, or a blank space ' '. These characters divide the square into contiguous regions. Given the grid as an array of strings, return the number of regions.",
        "Example 1:\nInput: grid = [\" /\",\"/ \"]\nOutput: 2",
        "Example 2:\nInput: grid = [\" /\",\"  \"]\nOutput: 1\nExplanation: A single slash that does not close off any area leaves one region.",
        "Constraints:\n- n == grid.length == grid[i].length\n- 1 <= n <= 30\n- grid[i][j] is either '/', a backslash, or ' '",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

int regionsBySlashes(vector<string>& grid) {
    int n = grid.size();
    DSU dsu(4 * n * n);
    // Per cell: 0 = north triangle, 1 = east, 2 = south, 3 = west.
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < n; c++) {
            int base = 4 * (r * n + c);
            char ch = grid[r][c];
            if (ch == '/') {
                dsu.unite(base + 0, base + 3);
                dsu.unite(base + 1, base + 2);
            } else if (ch == ' ') {
                dsu.unite(base + 0, base + 1);
                dsu.unite(base + 1, base + 2);
                dsu.unite(base + 2, base + 3);
            } else {
                // backslash: north joins east, south joins west
                dsu.unite(base + 0, base + 1);
                dsu.unite(base + 2, base + 3);
            }
            if (r + 1 < n) dsu.unite(base + 2, 4 * ((r + 1) * n + c) + 0);
            if (c + 1 < n) dsu.unite(base + 1, 4 * (r * n + c + 1) + 3);
        }
    }
    return dsu.components;
}`,
      explanation: [
        "A slash cannot be represented by a single cell node, because one cell may hold two different regions. Splitting every cell into four triangles (north, east, south, west) makes the diagonals expressible: '/' glues north-west and east-south, a backslash glues north-east and south-west, and a blank glues all four.",
        "Neighbouring cells are then stitched along their shared border: a cell's south triangle joins the triangle below's north triangle, and its east triangle joins the triangle to the right's west triangle. Every region of the picture becomes exactly one DSU component of triangles.",
        "Time: O(n^2 * alpha(n^2)). Space: O(n^2).",
      ],
    },
    {
      name: "Road Construction",
      difficulty: "Medium",
      variation: "Incremental components and largest size",
      link: "https://cses.fi/problemset/task/1676",
      question: [
        "There are n cities and initially no roads between them. Then m roads are built one after another. After each new road, print the number of connected components of cities and the size of the largest component.",
        "Example 1:\nInput:\n5 3\n1 2\n1 3\n4 5\nOutput:\n4 2\n3 3\n2 3\nExplanation: After the first road the components are {1,2},{3},{4},{5}; after the second {1,2,3},{4},{5}; after the third {1,2,3},{4,5}.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 2 * 10^5\n- 1 <= a, b <= n",
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    DSU dsu(n + 1);
    int comps = n, best = 1;
    string out;
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        int ra = dsu.find(a), rb = dsu.find(b);
        if (ra != rb) {
            dsu.unite(a, b);
            comps--;
            best = max(best, dsu.size[dsu.find(a)]);
        }
        out += to_string(comps);
        out += ' ';
        out += to_string(best);
        out += '\\n';
    }
    cout << out;
    return 0;
}`,
      explanation: [
        "Cities are numbered from 1, so the DSU is allocated with n + 1 slots and the unused slot 0 is simply ignored; the component counter is seeded to n by hand rather than read from the DSU.",
        "Both requested quantities are maintainable incrementally: a successful union always decreases the component count by exactly one, and the only component that can become the new largest is the one just formed, whose size union by size already stores at its root. The largest size never decreases, so a running maximum is correct.",
        "Time: O((n + m) * alpha(n)). Space: O(n + m) including the buffered output.",
      ],
    },
    {
      name: "Evaluate Division",
      difficulty: "Medium",
      variation: "Weighted DSU (ratios)",
      link: "https://leetcode.com/problems/evaluate-division/",
      question: [
        "You are given an array equations where equations[i] = [Ai, Bi] and an array values where values[i] represents Ai / Bi = values[i]. You are also given queries where queries[j] = [Cj, Dj] asking for the value of Cj / Dj. Return the answers to all queries; if a single answer cannot be determined, return -1.0 for it. The input is always valid and never contains a division by zero or a contradiction.",
        "Example 1:\nInput: equations = [[\"a\",\"b\"],[\"b\",\"c\"]], values = [2.0,3.0], queries = [[\"a\",\"c\"],[\"b\",\"a\"],[\"a\",\"e\"],[\"a\",\"a\"],[\"x\",\"x\"]]\nOutput: [6.0,0.5,-1.0,1.0,-1.0]",
        "Example 2:\nInput: equations = [[\"a\",\"b\"]], values = [0.5], queries = [[\"a\",\"b\"],[\"b\",\"a\"],[\"a\",\"c\"]]\nOutput: [0.5,2.0,-1.0]",
        "Constraints:\n- 1 <= equations.length <= 20\n- equations[i].length == 2\n- 1 <= Ai.length, Bi.length <= 5\n- values.length == equations.length\n- 0.0 < values[i] <= 20.0\n- 1 <= queries.length <= 20\n- Ai, Bi, Cj, Dj consist of lowercase English letters and digits",
      ],
      code: `struct WeightedDSU {
    vector<int> parent;
    vector<double> weight; // value(x) = weight[x] * value(parent[x])
    WeightedDSU(int n) : parent(n), weight(n, 1.0) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        if (parent[x] == x) return x;
        int p = parent[x];
        int root = find(p);
        weight[x] *= weight[p];
        parent[x] = root;
        return root;
    }
    // Records value(a) / value(b) = val.
    void unite(int a, int b, double val) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return;
        parent[ra] = rb;
        weight[ra] = val * weight[b] / weight[a];
    }
};

vector<double> calcEquation(vector<vector<string>>& equations, vector<double>& values,
                            vector<vector<string>>& queries) {
    unordered_map<string, int> id;
    for (auto& e : equations) {
        if (id.find(e[0]) == id.end()) { int k = id.size(); id[e[0]] = k; }
        if (id.find(e[1]) == id.end()) { int k = id.size(); id[e[1]] = k; }
    }
    WeightedDSU dsu(id.size());
    for (int i = 0; i < (int)equations.size(); i++)
        dsu.unite(id[equations[i][0]], id[equations[i][1]], values[i]);
    vector<double> res;
    for (auto& q : queries) {
        auto a = id.find(q[0]);
        auto b = id.find(q[1]);
        if (a == id.end() || b == id.end()) { res.push_back(-1.0); continue; }
        if (dsu.find(a->second) != dsu.find(b->second)) { res.push_back(-1.0); continue; }
        res.push_back(dsu.weight[a->second] / dsu.weight[b->second]);
    }
    return res;
}`,
      explanation: [
        "This is a DSU carrying a multiplicative potential. The invariant is weight[x] = value(x) / value(parent[x]); after a find with full path compression every node points straight at its root, so weight[x] = value(x) / value(root).",
        "find must multiply weight[x] by weight[parent[x]] only after the recursive call has already compressed the parent, otherwise the accumulated ratio is stale. Once both query variables are compressed to the same root, their ratio is weight[a] / weight[b] because the shared root cancels.",
        "Merging uses the same algebra: attaching root ra under rb requires weight[ra] = val * weight[b] / weight[a], derived directly from val = value(a) / value(b).",
        "Time: O((E + Q) * alpha(V)) amortized. Space: O(V).",
      ],
    },
    {
      name: "Possible Bipartition",
      difficulty: "Medium",
      variation: "DSU on parity (bipartite check)",
      link: "https://leetcode.com/problems/possible-bipartition/",
      question: [
        "We want to split a group of n people labeled from 1 to n into two groups of any size. Each person may dislike some others, and they should not go into the same group. Given the integer n and the array dislikes where dislikes[i] = [ai, bi] indicates that person ai does not like person bi, return true if it is possible to split everyone into two groups this way.",
        "Example 1:\nInput: n = 4, dislikes = [[1,2],[1,3],[2,4]]\nOutput: true\nExplanation: group1 = [1,4], group2 = [2,3].",
        "Example 2:\nInput: n = 3, dislikes = [[1,2],[1,3],[2,3]]\nOutput: false",
        "Constraints:\n- 1 <= n <= 2000\n- 0 <= dislikes.length <= 10^4\n- dislikes[i].length == 2\n- 1 <= ai < bi <= n\n- All the pairs of dislikes are unique",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

bool possibleBipartition(int n, vector<vector<int>>& dislikes) {
    // Node i means "i is in group A", node i + n means "i is in group B".
    DSU dsu(2 * n + 1);
    for (auto& d : dislikes) {
        int a = d[0], b = d[1];
        if (dsu.find(a) == dsu.find(b)) return false;
        dsu.unite(a, b + n);
        dsu.unite(a + n, b);
    }
    return true;
}`,
      explanation: [
        "The doubled-node trick encodes parity in a plain DSU: slot i represents \"i is on side A\" and slot i + n represents \"i is on side B\". An edge saying a and b must differ is recorded by uniting a with b's opposite and a's opposite with b.",
        "Before applying an edge, check whether a and b are already forced onto the same side; if so the constraints contain an odd cycle and no bipartition exists. Because every constraint is added symmetrically, the two copies of each person stay consistent throughout.",
        "The alternative is a DSU with a stored parity offset per node, which uses n slots instead of 2n but needs the same relative-parity bookkeeping as a weighted DSU.",
        "Time: O(m * alpha(n)). Space: O(n).",
      ],
    },
    {
      name: "Similar String Groups",
      difficulty: "Hard",
      variation: "Pairwise similarity + DSU",
      link: "https://leetcode.com/problems/similar-string-groups/",
      question: [
        "Two strings X and Y are similar if we can swap two letters (at different positions) of X so that it equals Y, or if X equals Y. Given a list strs of strings that are all anagrams of each other, group them so that each string is in a group with every string it is similar to, directly or transitively. Return the number of groups.",
        "Example 1:\nInput: strs = [\"tars\",\"rats\",\"arts\",\"star\"]\nOutput: 2\nExplanation: {\"tars\",\"rats\",\"arts\"} and {\"star\"}.",
        "Example 2:\nInput: strs = [\"omv\",\"ovm\"]\nOutput: 1",
        "Constraints:\n- 1 <= strs.length <= 300\n- 1 <= strs[i].length <= 300\n- strs[i] consists of lowercase letters only\n- All words in strs have the same length and are anagrams of each other",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

bool similar(const string& a, const string& b) {
    int diff = 0;
    for (int i = 0; i < (int)a.size(); i++) {
        if (a[i] != b[i]) {
            diff++;
            if (diff > 2) return false;
        }
    }
    return true;
}

int numSimilarGroups(vector<string>& strs) {
    int n = strs.size();
    DSU dsu(n);
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (similar(strs[i], strs[j])) dsu.unite(i, j);
    return dsu.components;
}`,
      explanation: [
        "Similarity itself is not transitive, but the grouping asked for is the transitive closure of it, which is exactly a connected-components question. Build the graph implicitly by testing every pair and union the similar ones.",
        "Since all inputs are anagrams, two strings are similar exactly when they differ in zero or two positions; the character-comparison loop can bail out as soon as a third mismatch appears.",
        "With n at most 300 the quadratic pair scan is cheap, and comparing pairs is preferable to generating all swap variants when the words are long.",
        "Time: O(n^2 * L) where L is the word length. Space: O(n).",
      ],
    },
    {
      name: "Number of Islands II",
      difficulty: "Hard",
      variation: "Incremental grid DSU",
      question: [
        "You are given an empty m x n grid of water cells and an array positions where positions[i] = [ri, ci] is a land cell to be added, one operation at a time. Return an array of length positions.length where the i-th value is the number of islands after the i-th operation. An island is a maximal group of land cells connected in the four cardinal directions. Adding land at an already-land cell leaves the count unchanged.",
        "Example 1:\nInput: m = 3, n = 3, positions = [[0,0],[0,1],[1,2],[2,1]]\nOutput: [1,1,2,3]\nExplanation: The second cell merges into the first island; the third and fourth are separate.",
        "Example 2:\nInput: m = 1, n = 1, positions = [[0,0]]\nOutput: [1]",
        "Constraints:\n- 1 <= m, n, m * n <= 10^4\n- 1 <= positions.length <= 10^4\n- 0 <= ri < m and 0 <= ci < n",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

vector<int> numIslands2(int m, int n, vector<vector<int>>& positions) {
    DSU dsu(m * n);
    vector<char> land(m * n, 0);
    int dr[4] = {-1, 1, 0, 0};
    int dc[4] = {0, 0, -1, 1};
    int count = 0;
    vector<int> res;
    res.reserve(positions.size());
    for (auto& p : positions) {
        int r = p[0], c = p[1], id = r * n + c;
        if (!land[id]) {
            land[id] = 1;
            count++;
            for (int k = 0; k < 4; k++) {
                int nr = r + dr[k], nc = c + dc[k];
                if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
                int nid = nr * n + nc;
                if (land[nid] && dsu.unite(id, nid)) count--;
            }
        }
        res.push_back(count);
    }
    return res;
}`,
      explanation: [
        "DSU is the right structure here precisely because the graph only ever gains edges. Re-running a flood fill after each addition would be O(k * m * n); incremental union keeps each step near constant.",
        "Adding a land cell provisionally raises the island count by one, then each successful union with an already-land neighbour lowers it again. The DSU is pre-allocated over all m * n cells and a separate land array marks which slots are active, so unions with water cells are never attempted.",
        "Repeated positions must be ignored, otherwise the count would be incremented for a cell that is already land.",
        "Time: O(m * n + k * alpha(m * n)) for k operations. Space: O(m * n).",
      ],
    },
    {
      name: "Checking Existence of Edge Length Limited Paths",
      difficulty: "Hard",
      variation: "Offline queries + DSU",
      link: "https://leetcode.com/problems/checking-existence-of-edge-length-limited-paths/",
      question: [
        "An undirected graph of n nodes is defined by edgeList where edgeList[i] = [ui, vi, disi] denotes an edge between ui and vi with distance disi. Note that there may be multiple edges between two nodes. Given an array queries where queries[j] = [pj, qj, limitj], return a boolean array answer where answer[j] is true if there is a path between pj and qj such that every edge on the path has distance strictly less than limitj.",
        "Example 1:\nInput: n = 3, edgeList = [[0,1,2],[1,2,4],[2,0,8],[1,0,16]], queries = [[0,1,2],[0,2,5]]\nOutput: [false,true]\nExplanation: For the first query no edge below distance 2 connects 0 and 1; for the second, 0-1 (2) and 1-2 (4) are both below 5.",
        "Constraints:\n- 2 <= n <= 10^5\n- 1 <= edgeList.length, queries.length <= 10^5\n- edgeList[i].length == 3 and queries[j].length == 3\n- 0 <= ui, vi, pj, qj <= n - 1 with ui != vi and pj != qj\n- 1 <= disi, limitj <= 10^9",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

vector<bool> distanceLimitedPathsExist(int n, vector<vector<int>>& edgeList,
                                       vector<vector<int>>& queries) {
    sort(edgeList.begin(), edgeList.end(),
         [](const vector<int>& a, const vector<int>& b) { return a[2] < b[2]; });
    int q = queries.size();
    vector<int> order(q);
    for (int i = 0; i < q; i++) order[i] = i;
    sort(order.begin(), order.end(),
         [&](int a, int b) { return queries[a][2] < queries[b][2]; });
    DSU dsu(n);
    vector<bool> res(q, false);
    int e = 0;
    for (int idx : order) {
        int limit = queries[idx][2];
        while (e < (int)edgeList.size() && edgeList[e][2] < limit) {
            dsu.unite(edgeList[e][0], edgeList[e][1]);
            e++;
        }
        res[idx] = (dsu.find(queries[idx][0]) == dsu.find(queries[idx][1]));
    }
    return res;
}`,
      explanation: [
        "Answering queries in the given order would require removing edges, which a plain DSU cannot do. Answering them offline in increasing order of limit means the edge set only grows, which is exactly what DSU supports.",
        "Sort the edges by distance and the query indices by limit, then sweep: before answering a query, add every edge with distance strictly less than its limit. The edge pointer never rewinds, so all edges are inserted at most once across the whole sweep.",
        "Results are written back through the original query index so the returned array matches the input order.",
        "Time: O(m log m + q log q + (m + q) * alpha(n)). Space: O(n + q).",
      ],
    },
    {
      name: "Number of Good Paths",
      difficulty: "Hard",
      variation: "DSU by increasing value threshold",
      link: "https://leetcode.com/problems/number-of-good-paths/",
      question: [
        "There is a tree of n nodes numbered from 0 to n - 1, given by edges, and an array vals where vals[i] is the value of node i. A path is good if the starting and ending nodes have the same value and every node on the path has a value less than or equal to that value. Return the number of distinct good paths. A single node counts as a good path, and a path and its reverse count as the same path.",
        "Example 1:\nInput: vals = [1,3,2,1,3], edges = [[0,1],[0,2],[2,3],[2,4]]\nOutput: 6\nExplanation: The 5 single-node paths plus the path 1 - 0 - 2 - 4.",
        "Example 2:\nInput: vals = [1,1,2,2,3], edges = [[0,1],[1,2],[2,3],[2,4]]\nOutput: 7",
        "Constraints:\n- n == vals.length\n- 1 <= n <= 3 * 10^4\n- 0 <= vals[i] <= 10^5\n- edges.length == n - 1\n- The given edges form a tree",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

int numberOfGoodPaths(vector<int>& vals, vector<vector<int>>& edges) {
    int n = vals.size();
    vector<vector<int>> adj(n);
    for (auto& e : edges) {
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]);
    }
    vector<int> order(n);
    for (int i = 0; i < n; i++) order[i] = i;
    sort(order.begin(), order.end(), [&](int a, int b) { return vals[a] < vals[b]; });
    DSU dsu(n);
    long long ans = n; // every single node is a good path
    int i = 0;
    while (i < n) {
        int v = vals[order[i]];
        int j = i;
        while (j < n && vals[order[j]] == v) j++;
        for (int k = i; k < j; k++) {
            int u = order[k];
            for (int w : adj[u])
                if (vals[w] <= v) dsu.unite(u, w);
        }
        unordered_map<int, int> cnt;
        for (int k = i; k < j; k++) cnt[dsu.find(order[k])]++;
        for (auto& kv : cnt) {
            long long c = kv.second;
            ans += c * (c - 1) / 2;
        }
        i = j;
    }
    return (int)ans;
}`,
      explanation: [
        "Fix the maximum value v on the path. A good path with maximum v has both endpoints equal to v and stays inside the subgraph induced by nodes with value at most v. In a tree the path between two nodes is unique, so any two value-v nodes that are connected inside that subgraph give exactly one good path.",
        "Process the distinct values in increasing order. Before counting for value v, add every tree edge whose other endpoint has value at most v; the DSU therefore represents exactly the induced subgraph on nodes with value at most v, and it is built incrementally with no rebuilding.",
        "For each component, if it contains c nodes of value exactly v, it contributes c * (c - 1) / 2 pairs. Adding n at the start accounts for the single-node paths. Edges between two equal-value nodes get offered twice, which is harmless because a repeated union is a no-op.",
        "Time: O(n log n + n * alpha(n)). Space: O(n).",
      ],
    },
    {
      name: "Remove Max Number of Edges to Keep Graph Fully Traversable",
      difficulty: "Hard",
      variation: "Two parallel DSUs, shared edges first",
      link: "https://leetcode.com/problems/remove-max-number-of-edges-to-keep-graph-fully-traversable/",
      question: [
        "Alice and Bob have an undirected graph of n nodes labeled from 1 to n. Each edge is of type 1 (usable by Alice only), type 2 (Bob only) or type 3 (both). Given edges where edges[i] = [typei, ui, vi], find the maximum number of edges you can remove so that the graph is still fully traversable by both Alice and Bob. Return -1 if it is impossible for both to fully traverse the graph.",
        "Example 1:\nInput: n = 4, edges = [[3,1,2],[3,2,3],[1,1,3],[2,3,4]]\nOutput: 2\nExplanation: Keeping [3,1,2], [3,2,3] and [2,3,4] is enough for both, so 2 edges can be removed.",
        "Example 2:\nInput: n = 4, edges = [[3,2,3],[1,1,2],[2,3,4]]\nOutput: 0",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= edges.length <= min(10^5, 3 * n * (n - 1) / 2)\n- edges[i].length == 3\n- 1 <= typei <= 3\n- 1 <= ui < vi <= n\n- All tuples are distinct",
      ],
      code: `struct DSU {
    vector<int> parent, size;
    int components;
    DSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        return true;
    }
};

int maxNumEdgesToRemove(int n, vector<vector<int>>& edges) {
    DSU alice(n + 1), bob(n + 1);
    int used = 0;
    for (auto& e : edges) {
        if (e[0] != 3) continue;
        bool a = alice.unite(e[1], e[2]);
        bool b = bob.unite(e[1], e[2]);
        if (a || b) used++;
    }
    for (auto& e : edges) {
        if (e[0] == 1) {
            if (alice.unite(e[1], e[2])) used++;
        } else if (e[0] == 2) {
            if (bob.unite(e[1], e[2])) used++;
        }
    }
    // Slot 0 is unused, so a fully connected graph leaves 2 components.
    if (alice.components != 2 || bob.components != 2) return -1;
    return (int)edges.size() - used;
}`,
      explanation: [
        "Keep two independent DSUs, one for the graph Alice can walk and one for Bob's. Minimising kept edges is equivalent to maximising removed edges, so the goal is a spanning structure for each of the two graphs using as few edges as possible.",
        "Type-3 edges must be processed first. A shared edge counts once but serves both DSUs, so it is never worse than two private edges achieving the same merges; processing them later could let private edges consume merges a shared edge would have covered for free. This exchange argument is the same greedy reasoning used in Kruskal.",
        "An edge is counted as used when it merges something in at least one of the two DSUs. At the end both graphs must be fully connected: because node labels start at 1 and slot 0 is left as its own singleton, full connectivity shows up as a component count of 2 rather than 1.",
        "Time: O(m * alpha(n)). Space: O(n).",
      ],
    },
    {
      name: "DSU with Rollback",
      difficulty: "Hard",
      variation: "Undoable unions (no path compression)",
      question: [
        "Implement a disjoint set union structure over n elements that supports rolling back unions, then process a list of operations in order. Each operation is one of: [1, a, b] union the sets of a and b; [2, 0, 0] undo the most recent union operation, restoring the structure to its state before it; [3, a, b] report whether a and b are currently in the same set. Return the answers to the type-3 operations in order, as 1 for connected and 0 for not connected.",
        "Example 1:\nInput: n = 4, ops = [[1,0,1],[3,0,1],[2,0,0],[3,0,1],[1,1,2],[1,2,3],[3,0,3],[2,0,0],[3,0,3]]\nOutput: [1,0,0,0]\nExplanation: The first union is undone, so 0 and 1 separate again; 0 is never joined to 3.",
        "Example 2:\nInput: n = 2, ops = [[3,0,1],[1,0,1],[3,0,1]]\nOutput: [0,1]",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 1 <= ops.length <= 4 * 10^5\n- 0 <= a, b < n\n- A type-2 operation never appears when there is no earlier un-undone union operation",
      ],
      code: `struct RollbackDSU {
    vector<int> parent, size;
    vector<pair<int, int>> history; // {attached root, absorbing root}, or {-1, -1} for a no-op
    int components;

    RollbackDSU(int n) : parent(n), size(n, 1), components(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    // No path compression: the parent pointers must stay exactly undoable.
    int find(int x) const {
        while (parent[x] != x) x = parent[x];
        return x;
    }

    bool unite(int a, int b) {
        a = find(a);
        b = find(b);
        if (a == b) {
            history.push_back({-1, -1});
            return false;
        }
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        components--;
        history.push_back({b, a});
        return true;
    }

    void rollback() {
        if (history.empty()) return;
        pair<int, int> last = history.back();
        history.pop_back();
        int b = last.first, a = last.second;
        if (b == -1) return;
        size[a] -= size[b];
        parent[b] = b;
        components++;
    }
};

vector<int> processOperations(int n, vector<vector<int>>& ops) {
    RollbackDSU dsu(n);
    vector<int> res;
    for (auto& op : ops) {
        if (op[0] == 1) {
            dsu.unite(op[1], op[2]);
        } else if (op[0] == 2) {
            dsu.rollback();
        } else {
            res.push_back(dsu.find(op[1]) == dsu.find(op[2]) ? 1 : 0);
        }
    }
    return res;
}`,
      explanation: [
        "Rollback and path compression are incompatible. Compression rewrites arbitrarily many parent pointers during a find, and those rewrites are not recorded, so an undo could not restore the previous shape. This DSU therefore uses union by size only and a find that walks to the root without touching anything.",
        "Union by size alone still bounds the tree height by O(log n), because a node's depth can only increase when its component is absorbed by one at least as large, which at least doubles the component size. So find is O(log n) worst case rather than near-constant.",
        "Each union pushes one record onto a stack: the root that got attached and the root that absorbed it. Undoing is then three assignments - detach the child root, subtract the size it contributed, and restore the component counter. Unions that found both elements already connected are pushed as sentinel no-ops so that a rollback consumes exactly one union operation.",
        "This is the building block for offline dynamic connectivity and for divide-and-conquer over a query timeline, where unions are applied down a recursion branch and rolled back on the way out.",
        "Time: O(log n) per union, find and query; O(1) per rollback. Space: O(n + number of unions).",
      ],
    },
  ],
};
