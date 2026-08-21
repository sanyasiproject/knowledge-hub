import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Subsets",
      difficulty: "Easy",
      variation: "Subset enumeration",
      link: "https://leetcode.com/problems/subsets/",
      question: [
        "Given an integer array nums of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets; return it in any order.",
        "Example 1:\nInput: nums = [1,2,3]\nOutput: [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]",
        "Constraints:\n- 1 <= nums.length <= 10\n- -10 <= nums[i] <= 10\n- All the numbers of nums are unique",
      ],
      code: `vector<vector<int>> subsets(vector<int>& nums) {
    vector<vector<int>> out;
    vector<int> cur;
    function<void(int)> dfs = [&](int i) {
        if (i == (int)nums.size()) { out.push_back(cur); return; }
        dfs(i + 1);
        cur.push_back(nums[i]);
        dfs(i + 1);
        cur.pop_back();
    };
    dfs(0);
    return out;
}`,
      explanation: [
        "At each index there are exactly two choices: exclude the element or include it. Recursing on both branches at every index enumerates all 2^n subsets exactly once.",
        "The pop_back after the include branch is the un-choose step: it restores the shared path vector so sibling branches see a clean state.",
        "Time: O(n * 2^n). Space: O(n) recursion depth (output excluded).",
      ],
    },
    {
      name: "Combinations",
      difficulty: "Easy",
      variation: "Fixed-size combinations",
      link: "https://leetcode.com/problems/combinations/",
      question: [
        "Given two integers n and k, return all possible combinations of k numbers chosen from the range [1, n]. You may return the answer in any order.",
        "Example 1:\nInput: n = 4, k = 2\nOutput: [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]",
        "Constraints:\n- 1 <= n <= 20\n- 1 <= k <= n",
      ],
      code: `vector<vector<int>> combine(int n, int k) {
    vector<vector<int>> out;
    vector<int> cur;
    function<void(int)> dfs = [&](int start) {
        if ((int)cur.size() == k) { out.push_back(cur); return; }
        // prune: not enough numbers left to reach size k
        for (int v = start; v <= n - (k - (int)cur.size()) + 1; v++) {
            cur.push_back(v);
            dfs(v + 1);
            cur.pop_back();
        }
    };
    dfs(1);
    return out;
}`,
      explanation: [
        "Build combinations in increasing order by always recursing with a start value one past the last chosen number, so each combination is generated exactly once (no permutations of the same set).",
        "The loop upper bound prunes branches that cannot possibly collect k numbers, which cuts the tree substantially for large n.",
        "Time: O(k * C(n, k)). Space: O(k) recursion depth.",
      ],
    },
    {
      name: "Letter Combinations of a Phone Number",
      difficulty: "Easy",
      variation: "Cartesian product",
      link: "https://leetcode.com/problems/letter-combinations-of-a-phone-number/",
      question: [
        "Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent (using the classic phone keypad mapping). Return the answer in any order.",
        "Example 1:\nInput: digits = \"23\"\nOutput: [\"ad\",\"ae\",\"af\",\"bd\",\"be\",\"bf\",\"cd\",\"ce\",\"cf\"]",
        "Constraints:\n- 0 <= digits.length <= 4\n- digits[i] is a digit in the range ['2', '9']",
      ],
      code: `vector<string> letterCombinations(string digits) {
    if (digits.empty()) return {};
    vector<string> keys = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
    vector<string> out;
    string cur;
    function<void(int)> dfs = [&](int i) {
        if (i == (int)digits.size()) { out.push_back(cur); return; }
        for (char c : keys[digits[i] - '0']) {
            cur.push_back(c);
            dfs(i + 1);
            cur.pop_back();
        }
    };
    dfs(0);
    return out;
}`,
      explanation: [
        "Each digit contributes an independent set of 3 or 4 letters; the answer is the Cartesian product of those sets, which backtracking builds one position at a time.",
        "Choose a letter for position i, explore position i+1, then pop the letter so the next candidate for position i starts from the same prefix.",
        "Time: O(4^n * n) where n is the number of digits. Space: O(n) recursion depth.",
      ],
    },
    {
      name: "Generate Parentheses",
      difficulty: "Medium",
      variation: "Constrained sequence building",
      link: "https://leetcode.com/problems/generate-parentheses/",
      question: [
        "Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.",
        "Example 1:\nInput: n = 3\nOutput: [\"((()))\",\"(()())\",\"(())()\",\"()(())\",\"()()()\"]",
        "Constraints:\n- 1 <= n <= 8",
      ],
      code: `vector<string> generateParenthesis(int n) {
    vector<string> out;
    string cur;
    function<void(int, int)> dfs = [&](int open, int close) {
        if ((int)cur.size() == 2 * n) { out.push_back(cur); return; }
        if (open < n) {
            cur.push_back('(');
            dfs(open + 1, close);
            cur.pop_back();
        }
        if (close < open) {
            cur.push_back(')');
            dfs(open, close + 1);
            cur.pop_back();
        }
    };
    dfs(0, 0);
    return out;
}`,
      explanation: [
        "Instead of generating all 2^(2n) strings and filtering, enforce validity during construction: an opening bracket is allowed while fewer than n are used, and a closing bracket only while it would not exceed the opens so far.",
        "Every prefix explored is a prefix of at least one valid string, so the search tree contains exactly the Catalan-number-many valid sequences plus their prefixes.",
        "Time: O(Catalan(n) * n) which is O(4^n / sqrt(n)). Space: O(n) recursion depth.",
      ],
    },
    {
      name: "Combination Sum",
      difficulty: "Medium",
      variation: "Unbounded pick with target",
      link: "https://leetcode.com/problems/combination-sum/",
      question: [
        "Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target. The same number may be chosen an unlimited number of times.",
        "Example 1:\nInput: candidates = [2,3,6,7], target = 7\nOutput: [[2,2,3],[7]]",
        "Constraints:\n- 1 <= candidates.length <= 30\n- 2 <= candidates[i] <= 40\n- All elements of candidates are distinct\n- 1 <= target <= 40",
      ],
      code: `vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
    vector<vector<int>> out;
    vector<int> cur;
    sort(candidates.begin(), candidates.end());
    function<void(int, int)> dfs = [&](int i, int rem) {
        if (rem == 0) { out.push_back(cur); return; }
        for (int j = i; j < (int)candidates.size(); j++) {
            if (candidates[j] > rem) break;
            cur.push_back(candidates[j]);
            dfs(j, rem - candidates[j]);  // j again: reuse allowed
            cur.pop_back();
        }
    };
    dfs(0, target);
    return out;
}`,
      explanation: [
        "Recurse with a start index so combinations are built in non-decreasing order of candidate index, which prevents the same multiset from appearing in different orders.",
        "Passing j (not j+1) into the recursion allows unlimited reuse of a candidate; sorting lets the loop break early once a candidate exceeds the remaining target.",
        "Time: exponential in the worst case, roughly O(n^(target/minCandidate)). Space: O(target/minCandidate) recursion depth.",
      ],
    },
    {
      name: "Combination Sum III",
      difficulty: "Medium",
      variation: "Fixed count and fixed sum",
      link: "https://leetcode.com/problems/combination-sum-iii/",
      question: [
        "Find all valid combinations of k numbers that sum up to n such that only numbers 1 through 9 are used and each number is used at most once. Return the list of all possible valid combinations.",
        "Example 1:\nInput: k = 3, n = 7\nOutput: [[1,2,4]]",
        "Example 2:\nInput: k = 3, n = 9\nOutput: [[1,2,6],[1,3,5],[2,3,4]]",
        "Constraints:\n- 2 <= k <= 9\n- 1 <= n <= 60",
      ],
      code: `vector<vector<int>> combinationSum3(int k, int n) {
    vector<vector<int>> out;
    vector<int> cur;
    function<void(int, int)> dfs = [&](int start, int rem) {
        if ((int)cur.size() == k) {
            if (rem == 0) out.push_back(cur);
            return;
        }
        for (int v = start; v <= 9; v++) {
            if (v > rem) break;
            cur.push_back(v);
            dfs(v + 1, rem - v);
            cur.pop_back();
        }
    };
    dfs(1, n);
    return out;
}`,
      explanation: [
        "Same start-index pattern as Combinations, but with two termination conditions at once: the path must hold exactly k numbers and the remaining sum must be exactly zero.",
        "Breaking when the candidate exceeds the remaining sum prunes hopeless branches early since values only grow.",
        "Time: O(k * C(9, k)) which is tiny (at most 9 choose k paths). Space: O(k) recursion depth.",
      ],
    },
    {
      name: "Subsets II",
      difficulty: "Medium",
      variation: "Subsets with duplicates",
      link: "https://leetcode.com/problems/subsets-ii/",
      question: [
        "Given an integer array nums that may contain duplicates, return all possible subsets (the power set). The solution set must not contain duplicate subsets; return it in any order.",
        "Example 1:\nInput: nums = [1,2,2]\nOutput: [[],[1],[1,2],[1,2,2],[2],[2,2]]",
        "Constraints:\n- 1 <= nums.length <= 10\n- -10 <= nums[i] <= 10",
      ],
      code: `vector<vector<int>> subsetsWithDup(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    vector<vector<int>> out;
    vector<int> cur;
    function<void(int)> dfs = [&](int start) {
        out.push_back(cur);
        for (int i = start; i < (int)nums.size(); i++) {
            if (i > start && nums[i] == nums[i - 1]) continue;  // skip duplicate branch
            cur.push_back(nums[i]);
            dfs(i + 1);
            cur.pop_back();
        }
    };
    dfs(0);
    return out;
}`,
      explanation: [
        "Sort first so equal values are adjacent, then at each tree level allow only the first occurrence of a value to start a new branch; later equal values at the same level would rebuild an identical subset.",
        "Every node of the recursion tree is itself a valid subset, so the current path is recorded on entry rather than only at leaves.",
        "Time: O(n * 2^n) worst case. Space: O(n) recursion depth.",
      ],
    },
    {
      name: "Permutations",
      difficulty: "Medium",
      variation: "Permutation enumeration",
      link: "https://leetcode.com/problems/permutations/",
      question: [
        "Given an array nums of distinct integers, return all the possible permutations. You can return the answer in any order.",
        "Example 1:\nInput: nums = [1,2,3]\nOutput: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]",
        "Constraints:\n- 1 <= nums.length <= 6\n- -10 <= nums[i] <= 10\n- All the integers of nums are unique",
      ],
      code: `vector<vector<int>> permute(vector<int>& nums) {
    int n = nums.size();
    vector<vector<int>> out;
    vector<int> cur;
    vector<bool> used(n, false);
    function<void()> dfs = [&]() {
        if ((int)cur.size() == n) { out.push_back(cur); return; }
        for (int i = 0; i < n; i++) {
            if (used[i]) continue;
            used[i] = true;
            cur.push_back(nums[i]);
            dfs();
            cur.pop_back();
            used[i] = false;
        }
    };
    dfs();
    return out;
}`,
      explanation: [
        "Unlike subsets, order matters, so at every depth all still-unused elements are candidates; a used[] array tracks which elements are already on the path.",
        "Choose (mark used, push), explore (recurse), un-choose (pop, unmark) guarantees each of the n! orderings is produced exactly once.",
        "Time: O(n * n!). Space: O(n) for the path and used array.",
      ],
    },
    {
      name: "Permutations II",
      difficulty: "Medium",
      variation: "Permutations with duplicates",
      link: "https://leetcode.com/problems/permutations-ii/",
      question: [
        "Given a collection of numbers, nums, that might contain duplicates, return all possible unique permutations in any order.",
        "Example 1:\nInput: nums = [1,1,2]\nOutput: [[1,1,2],[1,2,1],[2,1,1]]",
        "Constraints:\n- 1 <= nums.length <= 8\n- -10 <= nums[i] <= 10",
      ],
      code: `vector<vector<int>> permuteUnique(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    int n = nums.size();
    vector<vector<int>> out;
    vector<int> cur;
    vector<bool> used(n, false);
    function<void()> dfs = [&]() {
        if ((int)cur.size() == n) { out.push_back(cur); return; }
        for (int i = 0; i < n; i++) {
            if (used[i]) continue;
            // among equal values, force left-to-right usage order
            if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue;
            used[i] = true;
            cur.push_back(nums[i]);
            dfs();
            cur.pop_back();
            used[i] = false;
        }
    };
    dfs();
    return out;
}`,
      explanation: [
        "Sorting groups duplicates; the rule 'skip nums[i] if it equals nums[i-1] and nums[i-1] is not currently used' forces equal values to be consumed strictly left to right, so identical permutations are never generated twice.",
        "This dedupe happens at branch time (pruning) rather than by hashing results afterward, keeping the search tree minimal.",
        "Time: O(n * n!) worst case (all distinct). Space: O(n) recursion depth.",
      ],
    },
    {
      name: "Combination Sum II",
      difficulty: "Medium",
      variation: "Target sum with duplicates, single use",
      link: "https://leetcode.com/problems/combination-sum-ii/",
      question: [
        "Given a collection of candidate numbers (candidates, may contain duplicates) and a target number target, find all unique combinations in candidates where the candidate numbers sum to target. Each number may be used at most once.",
        "Example 1:\nInput: candidates = [10,1,2,7,6,1,5], target = 8\nOutput: [[1,1,6],[1,2,5],[1,7],[2,6]]",
        "Constraints:\n- 1 <= candidates.length <= 100\n- 1 <= candidates[i] <= 50\n- 1 <= target <= 30",
      ],
      code: `vector<vector<int>> combinationSum2(vector<int>& candidates, int target) {
    sort(candidates.begin(), candidates.end());
    vector<vector<int>> out;
    vector<int> cur;
    function<void(int, int)> dfs = [&](int start, int rem) {
        if (rem == 0) { out.push_back(cur); return; }
        for (int i = start; i < (int)candidates.size(); i++) {
            if (candidates[i] > rem) break;
            if (i > start && candidates[i] == candidates[i - 1]) continue;
            cur.push_back(candidates[i]);
            dfs(i + 1, rem - candidates[i]);
            cur.pop_back();
        }
    };
    dfs(0, target);
    return out;
}`,
      explanation: [
        "Combines two classic tricks: recurse with i+1 so each array element is used at most once, and skip a value at the same tree level if it equals its left neighbor so duplicate combinations never form.",
        "Sorting enables both the duplicate skip and the early break once a candidate exceeds the remaining target.",
        "Time: O(2^n) worst case. Space: O(n) recursion depth.",
      ],
    },
    {
      name: "Restore IP Addresses",
      difficulty: "Medium",
      variation: "String segmentation",
      link: "https://leetcode.com/problems/restore-ip-addresses/",
      question: [
        "Given a string s containing only digits, return all possible valid IP addresses that can be formed by inserting dots into s. A valid IP address consists of exactly four integers, each between 0 and 255 inclusive, with no leading zeros. You cannot reorder or remove digits.",
        "Example 1:\nInput: s = \"25525511135\"\nOutput: [\"255.255.11.135\",\"255.255.111.35\"]",
        "Constraints:\n- 1 <= s.length <= 20\n- s consists of digits only",
      ],
      code: `vector<string> restoreIpAddresses(string s) {
    vector<string> out;
    vector<string> parts;
    int n = s.size();
    function<void(int)> dfs = [&](int i) {
        if ((int)parts.size() == 4) {
            if (i == n) out.push_back(parts[0] + "." + parts[1] + "." + parts[2] + "." + parts[3]);
            return;
        }
        for (int len = 1; len <= 3 && i + len <= n; len++) {
            string seg = s.substr(i, len);
            if (len > 1 && seg[0] == '0') break;   // no leading zeros
            if (stoi(seg) > 255) break;            // segment too large
            parts.push_back(seg);
            dfs(i + len);
            parts.pop_back();
        }
    };
    dfs(0);
    return out;
}`,
      explanation: [
        "Each segment can only be 1 to 3 characters, so at every position there are at most three choices; validity checks (no leading zero, value at most 255) prune bad branches immediately.",
        "A candidate is accepted only when exactly four segments consume the whole string, which handles both too-short and too-long inputs naturally.",
        "Time: O(1) effectively (at most 3^4 segment layouts, each O(n) to validate). Space: O(1) beyond output.",
      ],
    },
    {
      name: "Palindrome Partitioning",
      difficulty: "Medium",
      variation: "Partition with predicate",
      link: "https://leetcode.com/problems/palindrome-partitioning/",
      question: [
        "Given a string s, partition s such that every substring of the partition is a palindrome. Return all possible palindrome partitionings of s.",
        "Example 1:\nInput: s = \"aab\"\nOutput: [[\"a\",\"a\",\"b\"],[\"aa\",\"b\"]]",
        "Constraints:\n- 1 <= s.length <= 16\n- s contains only lowercase English letters",
      ],
      code: `vector<vector<string>> partition(string s) {
    int n = s.size();
    vector<vector<string>> out;
    vector<string> cur;
    auto isPal = [&](int l, int r) {
        while (l < r) {
            if (s[l++] != s[r--]) return false;
        }
        return true;
    };
    function<void(int)> dfs = [&](int start) {
        if (start == n) { out.push_back(cur); return; }
        for (int end = start; end < n; end++) {
            if (!isPal(start, end)) continue;
            cur.push_back(s.substr(start, end - start + 1));
            dfs(end + 1);
            cur.pop_back();
        }
    };
    dfs(0);
    return out;
}`,
      explanation: [
        "At each starting position, try every prefix that is a palindrome as the next piece, then recurse on the rest of the string; non-palindromic prefixes are pruned before recursing.",
        "Because every character must belong to some piece and pieces are taken left to right, each valid partition is generated exactly once.",
        "Time: O(n * 2^n) worst case (a string of identical characters). Space: O(n) recursion depth.",
      ],
    },
    {
      name: "Word Search",
      difficulty: "Medium",
      variation: "Grid DFS with state restore",
      link: "https://leetcode.com/problems/word-search/",
      question: [
        "Given an m x n grid of characters board and a string word, return true if word exists in the grid. The word must be constructed from letters of sequentially adjacent cells (horizontally or vertically neighboring); the same cell may not be used more than once.",
        "Example 1:\nInput: board = [[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]], word = \"ABCCED\"\nOutput: true",
        "Constraints:\n- 1 <= m, n <= 6\n- 1 <= word.length <= 15\n- board and word consist of only lowercase and uppercase English letters",
      ],
      code: `bool exist(vector<vector<char>>& board, string word) {
    int m = board.size(), n = board[0].size();
    function<bool(int, int, int)> dfs = [&](int r, int c, int i) {
        if (r < 0 || r >= m || c < 0 || c >= n || board[r][c] != word[i]) return false;
        if (i == (int)word.size() - 1) return true;
        char tmp = board[r][c];
        board[r][c] = '#';  // mark visited
        bool found = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1) ||
                     dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);
        board[r][c] = tmp;  // un-choose
        return found;
    };
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (dfs(r, c, 0)) return true;
        }
    }
    return false;
}`,
      explanation: [
        "Start a DFS from every cell that matches the first letter; each step must match the next letter of the word, and visited cells are temporarily overwritten with a sentinel so a path never reuses a cell.",
        "Restoring the cell after all four directions fail is the un-choose step that lets other paths pass through it.",
        "Time: O(m * n * 3^L) where L is the word length (3 branches after the first step). Space: O(L) recursion depth.",
      ],
    },
    {
      name: "Matchsticks to Square",
      difficulty: "Medium",
      variation: "Bucket partitioning (4 groups)",
      link: "https://leetcode.com/problems/matchsticks-to-square/",
      question: [
        "You are given an integer array matchsticks where matchsticks[i] is the length of the i-th matchstick. Use every matchstick exactly once, without breaking any, to form a square. Return true if you can make the square, false otherwise.",
        "Example 1:\nInput: matchsticks = [1,1,2,2,2]\nOutput: true\nExplanation: One side is [2], the other three sides are [1,1], [2], [2] ... each side has length 2",
        "Constraints:\n- 1 <= matchsticks.length <= 15\n- 1 <= matchsticks[i] <= 10^8",
      ],
      code: `bool makesquare(vector<int>& matchsticks) {
    long long sum = accumulate(matchsticks.begin(), matchsticks.end(), 0LL);
    if (sum % 4 != 0) return false;
    long long side = sum / 4;
    sort(matchsticks.rbegin(), matchsticks.rend());  // big first: fail fast
    if (matchsticks[0] > side) return false;
    vector<long long> sides(4, 0);
    function<bool(int)> dfs = [&](int i) {
        if (i == (int)matchsticks.size()) return true;
        for (int k = 0; k < 4; k++) {
            if (sides[k] + matchsticks[i] > side) continue;
            if (k > 0 && sides[k] == sides[k - 1]) continue;  // symmetric bucket, skip
            sides[k] += matchsticks[i];
            if (dfs(i + 1)) return true;
            sides[k] -= matchsticks[i];
        }
        return false;
    };
    return dfs(0);
}`,
      explanation: [
        "Assign each stick to one of four side buckets; a bucket is a valid choice only if it does not overflow the target side length sum/4.",
        "Two key prunings make it fast: sorting descending so oversized sticks fail immediately, and skipping a bucket whose current length equals the previous bucket (identical buckets are interchangeable, so trying both is redundant).",
        "Time: O(4^n) worst case, far less in practice with pruning. Space: O(n) recursion depth.",
      ],
    },
    {
      name: "Partition to K Equal Sum Subsets",
      difficulty: "Medium",
      variation: "Bucket partitioning (k groups)",
      link: "https://leetcode.com/problems/partition-to-k-equal-sum-subsets/",
      question: [
        "Given an integer array nums and an integer k, return true if it is possible to divide this array into k non-empty subsets whose sums are all equal.",
        "Example 1:\nInput: nums = [4,3,2,3,5,2,1], k = 4\nOutput: true\nExplanation: It is possible to divide it into 4 subsets (5), (1,4), (2,3), (2,3) with equal sums",
        "Constraints:\n- 1 <= k <= nums.length <= 16\n- 1 <= nums[i] <= 10^4\n- The frequency of each element is in the range [1, 4]",
      ],
      code: `bool canPartitionKSubsets(vector<int>& nums, int k) {
    long long sum = accumulate(nums.begin(), nums.end(), 0LL);
    if (sum % k != 0) return false;
    long long target = sum / k;
    sort(nums.rbegin(), nums.rend());
    if (nums[0] > target) return false;
    vector<long long> buckets(k, 0);
    function<bool(int)> dfs = [&](int i) {
        if (i == (int)nums.size()) return true;
        for (int b = 0; b < k; b++) {
            if (buckets[b] + nums[i] > target) continue;
            if (b > 0 && buckets[b] == buckets[b - 1]) continue;  // symmetry pruning
            buckets[b] += nums[i];
            if (dfs(i + 1)) return true;
            buckets[b] -= nums[i];
            if (buckets[b] == 0) break;  // empty bucket failed: others will too
        }
        return false;
    };
    return dfs(0);
}`,
      explanation: [
        "Generalizes Matchsticks to Square to k buckets: place items one at a time into any bucket that stays at or below sum/k, backtracking when no bucket works.",
        "Three prunings are essential at n = 16: descending sort, skipping equal-valued buckets (symmetry), and breaking after an empty bucket fails because all remaining empty buckets are equivalent.",
        "Time: O(k^n) worst case, heavily pruned in practice. Space: O(n) recursion depth plus O(k) buckets.",
      ],
    },
    {
      name: "N-Queens",
      difficulty: "Hard",
      variation: "Constraint satisfaction, all solutions",
      link: "https://leetcode.com/problems/n-queens/",
      question: [
        "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Given an integer n, return all distinct solutions. Each solution is a board configuration where 'Q' indicates a queen and '.' indicates an empty square.",
        "Example 1:\nInput: n = 4\nOutput: [[\".Q..\",\"...Q\",\"Q...\",\"..Q.\"],[\"..Q.\",\"Q...\",\"...Q\",\".Q..\"]]",
        "Constraints:\n- 1 <= n <= 9",
      ],
      code: `vector<vector<string>> solveNQueens(int n) {
    vector<vector<string>> out;
    vector<string> board(n, string(n, '.'));
    vector<bool> col(n, false), diag1(2 * n, false), diag2(2 * n, false);
    function<void(int)> place = [&](int r) {
        if (r == n) { out.push_back(board); return; }
        for (int c = 0; c < n; c++) {
            if (col[c] || diag1[r + c] || diag2[r - c + n]) continue;
            col[c] = diag1[r + c] = diag2[r - c + n] = true;
            board[r][c] = 'Q';
            place(r + 1);
            board[r][c] = '.';
            col[c] = diag1[r + c] = diag2[r - c + n] = false;
        }
    };
    place(0);
    return out;
}`,
      explanation: [
        "Place one queen per row, so only columns and the two diagonal families need conflict checks; a cell (r, c) lies on anti-diagonal r+c and main diagonal r-c (offset by n to stay non-negative), giving O(1) attack checks with boolean arrays.",
        "On conflict the column is skipped; after exploring a placement, the queen and its three marks are removed so sibling columns start clean, the textbook choose/explore/un-choose pattern.",
        "Time: O(n!) upper bound on the pruned search. Space: O(n) recursion depth plus O(n) marker arrays.",
      ],
    },
    {
      name: "N-Queens II",
      difficulty: "Hard",
      variation: "Constraint satisfaction, count only",
      link: "https://leetcode.com/problems/n-queens-ii/",
      question: [
        "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Given an integer n, return the number of distinct solutions to the n-queens puzzle.",
        "Example 1:\nInput: n = 4\nOutput: 2",
        "Constraints:\n- 1 <= n <= 9",
      ],
      code: `int totalNQueens(int n) {
    int count = 0;
    // bitmasks: set bit = attacked column / diagonal in the current row
    function<void(int, int, int, int)> place = [&](int r, int cols, int d1, int d2) {
        if (r == n) { count++; return; }
        int free_ = ~(cols | d1 | d2) & ((1 << n) - 1);
        while (free_) {
            int bit = free_ & (-free_);  // lowest available column
            free_ -= bit;
            place(r + 1, cols | bit, ((d1 | bit) << 1) & ((1 << n) - 1), (d2 | bit) >> 1);
        }
    };
    place(0, 0, 0, 0);
    return count;
}`,
      explanation: [
        "Since only the count matters, the board is dropped entirely and the three constraint sets become bitmasks; shifting the diagonal masks by one when moving down a row keeps them aligned with the next row's columns.",
        "Extracting the lowest set bit of the free mask enumerates legal columns without a scan loop, and passing updated masks by value removes the explicit undo step.",
        "Time: O(n!) upper bound with very small constants. Space: O(n) recursion depth.",
      ],
    },
    {
      name: "Sudoku Solver",
      difficulty: "Hard",
      variation: "Exact constraint filling",
      link: "https://leetcode.com/problems/sudoku-solver/",
      question: [
        "Write a program to solve a Sudoku puzzle by filling the empty cells. Each digit 1-9 must occur exactly once in each row, each column, and each of the nine 3x3 sub-boxes. The '.' character indicates empty cells. Modify the board in place; the input is guaranteed to have exactly one solution.",
        "Example 1:\nInput: a 9x9 board with some cells filled and '.' elsewhere\nOutput: the same board with every '.' replaced so all Sudoku rules hold",
        "Constraints:\n- board.length == 9, board[i].length == 9\n- board[i][j] is a digit 1-9 or '.'\n- The input board has exactly one solution",
      ],
      code: `void solveSudoku(vector<vector<char>>& board) {
    function<bool(int, int, char)> ok = [&](int r, int c, char v) {
        for (int k = 0; k < 9; k++) {
            if (board[r][k] == v || board[k][c] == v) return false;
            if (board[3 * (r / 3) + k / 3][3 * (c / 3) + k % 3] == v) return false;
        }
        return true;
    };
    function<bool(int)> fill = [&](int pos) {
        if (pos == 81) return true;
        int r = pos / 9, c = pos % 9;
        if (board[r][c] != '.') return fill(pos + 1);
        for (char v = '1'; v <= '9'; v++) {
            if (!ok(r, c, v)) continue;
            board[r][c] = v;
            if (fill(pos + 1)) return true;
            board[r][c] = '.';
        }
        return false;
    };
    fill(0);
}`,
      explanation: [
        "Scan cells in a fixed order; for each empty cell try every digit that does not conflict with its row, column, or 3x3 box, recurse, and erase the digit if the recursion fails.",
        "Returning true up the call stack as soon as cell 81 is reached stops the search at the first (and only) solution, leaving the board filled in place.",
        "Time: O(9^m) worst case where m is the number of empty cells, drastically pruned by the validity check. Space: O(m) recursion depth.",
      ],
    },
  ],
};
