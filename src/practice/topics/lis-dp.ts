import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Longest Continuous Increasing Subsequence",
      difficulty: "Easy",
      variation: "Contiguous run, the warm-up before real LIS",
      link: "https://leetcode.com/problems/longest-continuous-increasing-subsequence/",
      question: [
        "Given an unsorted array of integers nums, return the length of the longest continuous strictly increasing subsequence - that is, the longest run of adjacent positions i, i+1, ..., j where every element is strictly greater than the one before it.",
        "Example 1:\nInput: nums = [1,3,5,4,7]\nOutput: 3\nExplanation: The run [1,3,5] has length 3. The run [4,7] has length 2. Note that [1,3,5,7] is increasing but not continuous, so it does not count.",
        "Example 2:\nInput: nums = [2,2,2,2,2]\nOutput: 1\nExplanation: No element is strictly greater than its neighbour, so every run has length 1.",
        "Constraints:\n- 1 <= nums.length <= 10^4\n- -10^9 <= nums[i] <= 10^9",
      ],
      code: `int findLengthOfLCIS(vector<int>& nums) {
    int best = 0, run = 0;
    for (int i = 0; i < (int)nums.size(); i++) {
        // a run can only be extended by the immediately preceding element
        if (i > 0 && nums[i] > nums[i - 1]) run++;
        else run = 1;
        best = max(best, run);
    }
    return best;
}`,
      explanation: [
        "State: run = the length of the longest increasing run that ends exactly at index i. Because the answer must be contiguous, there is only one candidate predecessor - index i-1 - so the transition is a single comparison rather than a scan over all earlier indices.",
        "That is the whole difference between this problem and true LIS, and it is worth internalising: 'subarray' gives you one predecessor and an O(n) algorithm, 'subsequence' gives you i predecessors and forces either an O(n^2) scan or a binary-search structure.",
        "The tempting mistake is to reset run to 0 instead of 1 on a break. The element at the break point still starts a run of length one by itself, so 1 is the correct restart value.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Longest Increasing Subsequence",
      difficulty: "Medium",
      variation: "O(n^2) DP, the template",
      link: "https://leetcode.com/problems/longest-increasing-subsequence/",
      question: [
        "Given an integer array nums, return the length of the longest strictly increasing subsequence. A subsequence is obtained by deleting some or no elements without changing the order of the remaining elements.",
        "Example 1:\nInput: nums = [10,9,2,5,3,7,101,18]\nOutput: 4\nExplanation: [2,3,7,101] is increasing and has length 4. [2,3,7,18] also has length 4; no length-5 increasing subsequence exists.",
        "Example 2:\nInput: nums = [0,1,0,3,2,3]\nOutput: 4\nExplanation: [0,1,2,3] has length 4.",
        "Constraints:\n- 1 <= nums.length <= 2500\n- -10^4 <= nums[i] <= 10^4",
      ],
      code: `int lengthOfLIS(vector<int>& nums) {
    int n = nums.size();
    vector<int> dp(n, 1);   // dp[i] = LIS length ending exactly at index i
    int best = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++)
            if (nums[j] < nums[i]) dp[i] = max(dp[i], dp[j] + 1);
        best = max(best, dp[i]);
    }
    return best;
}`,
      explanation: [
        "State: dp[i] = the length of the longest increasing subsequence whose last element is nums[i]. Anchoring the state at the final element is what makes the transition local: any such subsequence of length >= 2 has a second-to-last element at some index j < i with nums[j] < nums[i], and dropping nums[i] leaves a valid subsequence ending at j. So dp[i] = 1 + max over all valid j of dp[j], and 1 if no such j exists.",
        "Because the state is 'ending at i' rather than 'using the first i elements', the answer is not dp[n-1] but the maximum over all i. Returning dp[n-1] is the single most common bug here - it silently forces the last element into the subsequence.",
        "Strict versus non-strict is entirely the comparison nums[j] < nums[i]. Change it to <= and you get the longest non-decreasing subsequence. Nothing else in the code moves.",
        "A greedy sweep that keeps appending whenever the next element is larger than the last one taken is wrong: on [1,10,2,3,4] it yields [1,10] of length 2 while the answer is 4. You genuinely have to consider abandoning a large element.",
        "Time: O(n^2). Space: O(n).",
      ],
    },
    {
      name: "Longest Increasing Subsequence - Patience / Binary Search",
      difficulty: "Medium",
      variation: "O(n log n) tails array",
      link: "https://leetcode.com/problems/longest-increasing-subsequence/",
      question: [
        "Same problem as above: return the length of the longest strictly increasing subsequence of nums. This time solve it in O(n log n) so that it survives n up to 10^5 or more.",
        "Example 1:\nInput: nums = [4,10,4,3,8,9]\nOutput: 3\nExplanation: [4,8,9] has length 3.",
        "Example 2:\nInput: nums = [7,7,7,7,7,7,7]\nOutput: 1\nExplanation: Equal elements cannot extend a strictly increasing subsequence.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -10^9 <= nums[i] <= 10^9",
      ],
      code: `int lengthOfLIS(vector<int>& nums) {
    // tails[k] = the smallest possible tail value of an increasing subsequence of length k+1
    vector<int> tails;
    for (int x : nums) {
        // strict LIS -> lower_bound, so an equal value replaces instead of extending
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
    }
    return (int)tails.size();
}`,
      explanation: [
        "The invariant is the whole algorithm: after processing a prefix, tails[k] holds the minimum value that can end an increasing subsequence of length k+1 drawn from that prefix. tails is automatically strictly increasing, because a longer subsequence must end at a value strictly greater than the best tail of the shorter one, so binary search is legal.",
        "Processing x, let p be the first index with tails[p] >= x. Every subsequence of length p can be ended by a value strictly below x, so x extends one of them to length p+1, and x is at least as good a tail as whatever sat at tails[p] - hence the overwrite. Positions before p are untouched because their tails are already smaller than x. Nothing shrinks, and the array grows by one only when x beats every existing tail.",
        "For the non-strict (non-decreasing) version, switch lower_bound to upper_bound: an equal value should then be allowed to extend rather than merely replace.",
        "The trap is believing tails is itself an increasing subsequence of the input. It is not - its entries can come from positions in any order, and on [10,9,2,5,3,7,101,18] the final tails array is [2,3,7,18] only by coincidence of value, not by construction. It is a length certificate, not a witness. If you need the actual subsequence, store for each element the index it landed at plus a parent pointer and reconstruct from the last element that reached the maximum length.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Increasing Subsequence (CSES 1145)",
      difficulty: "Medium",
      variation: "Judge problem, O(n log n) at n = 2 * 10^5",
      link: "https://cses.fi/problemset/task/1145",
      question: [
        "You are given an array of n integers. Your task is to find the length of the longest strictly increasing subsequence, that is, the longest subsequence where every element is larger than the previous one. Read n and the array from standard input and print a single integer.",
        "Example 1:\nInput:\n8\n7 3 5 3 6 2 9 8\nOutput: 4\nExplanation: 3 5 6 9 is strictly increasing and has length 4; no length-5 increasing subsequence exists.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 1 <= x_i <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> tails;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
    }
    cout << tails.size() << "\\n";
    return 0;
}`,
      explanation: [
        "Straight application of the patience method. The point of including it is the constraint: n = 2 * 10^5 makes the O(n^2) table roughly 4 * 10^10 operations, so the binary-search version is not an optimisation here, it is the only option.",
        "There is no need to store the input array at all - each value is consumed the moment it is read, which keeps memory at O(answer) rather than O(n).",
        "Values go up to 10^9 but never get added together, so int is safe; only the count is printed. Do remember the fast-IO lines, since reading 2 * 10^5 integers with synchronised streams is measurable on CSES.",
        "Time: O(n log n). Space: O(n) worst case for tails.",
      ],
    },
    {
      name: "Longest Arithmetic Subsequence of Given Difference",
      difficulty: "Medium",
      variation: "Fixed-step chain, hash map replaces the inner scan",
      link: "https://leetcode.com/problems/longest-arithmetic-subsequence-of-given-difference/",
      question: [
        "Given an integer array arr and an integer difference, return the length of the longest subsequence of arr which is an arithmetic sequence such that the difference between adjacent elements in the subsequence equals difference.",
        "Example 1:\nInput: arr = [1,2,3,4], difference = 1\nOutput: 4\nExplanation: The whole array [1,2,3,4] is arithmetic with step 1.",
        "Example 2:\nInput: arr = [1,5,7,8,5,3,4,2,1], difference = -2\nOutput: 4\nExplanation: [7,5,3,1] is a subsequence with step -2 and has length 4.",
        "Constraints:\n- 1 <= arr.length <= 10^5\n- -10^4 <= arr[i], difference <= 10^4",
      ],
      code: `int longestSubsequence(vector<int>& arr, int difference) {
    unordered_map<int, int> dp;   // dp[v] = longest valid chain seen so far that ends at value v
    int best = 1;
    for (int x : arr) {
        int prev = 0;
        auto it = dp.find(x - difference);   // the unique predecessor value
        if (it != dp.end()) prev = it->second;
        dp[x] = prev + 1;                    // a later x can only do better, so overwriting is safe
        best = max(best, dp[x]);
    }
    return best;
}`,
      explanation: [
        "Fixing the step collapses the LIS transition. In general LIS the predecessor of nums[i] could be any smaller earlier element, which is why you scan. Here the predecessor must have value exactly x - difference, so the max over j degenerates to a single lookup and the state can be keyed by value instead of by index.",
        "Keying by value is only sound because the chain length ending at a value never decreases as we scan left to right: a chain ending at an earlier copy of x is also available to a later copy, so the newest computation is always at least as large as the stored one. Overwriting dp[x] therefore loses nothing.",
        "Order of the two statements matters: read dp[x - difference] before writing dp[x]. If difference is 0 those are the same key, and writing first would make every element chain onto itself and inflate the answer.",
        "The wrong instinct is to sort the array first. Subsequences must respect the original order, and sorting destroys it - with difference = -2 sorting would turn a decreasing chain into an increasing one and change the answer.",
        "Time: O(n) expected. Space: O(n).",
      ],
    },
    {
      name: "Largest Divisible Subset",
      difficulty: "Medium",
      variation: "LIS over a divisibility order, with reconstruction",
      link: "https://leetcode.com/problems/largest-divisible-subset/",
      question: [
        "Given a set of distinct positive integers nums, return the largest subset answer such that for every pair (a, b) in answer, either a divides b or b divides a. If there are multiple solutions, return any of them.",
        "Example 1:\nInput: nums = [1,2,4,8]\nOutput: [1,2,4,8]\nExplanation: Every element divides the next, so all four can be kept.",
        "Example 2:\nInput: nums = [1,2,3]\nOutput: [1,2]\nExplanation: 2 and 3 do not divide each other, so at most one of them joins 1. [1,3] is equally valid.",
        "Constraints:\n- 1 <= nums.length <= 1000\n- 1 <= nums[i] <= 2 * 10^9\n- All integers in nums are unique",
      ],
      code: `vector<int> largestDivisibleSubset(vector<int>& nums) {
    sort(nums.begin(), nums.end());   // after sorting, only smaller elements can divide nums[i]
    int n = nums.size();
    vector<int> dp(n, 1), par(n, -1);
    int bestIdx = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++)
            if (nums[i] % nums[j] == 0 && dp[j] + 1 > dp[i]) {
                dp[i] = dp[j] + 1;
                par[i] = j;           // remember the chosen predecessor for reconstruction
            }
        if (dp[i] > dp[bestIdx]) bestIdx = i;
    }
    vector<int> res;
    for (int i = bestIdx; i != -1; i = par[i]) res.push_back(nums[i]);
    reverse(res.begin(), res.end());
    return res;
}`,
      explanation: [
        "The key structural fact is that divisibility is transitive, so a set that is pairwise-divisible and sorted forms a chain a1 | a2 | ... | ak where each element divides its successor. Checking only adjacent pairs is then enough, and the problem becomes LIS with the comparison nums[j] < nums[i] replaced by nums[i] % nums[j] == 0.",
        "Sorting is what makes the one-directional scan valid: a divisor of nums[i] other than itself is strictly smaller, hence already to the left. Without sorting the transition would have to look both ways.",
        "Reconstruction is the reusable part. Store par[i] = the j that produced dp[i], track the index achieving the global maximum, then walk parents backwards and reverse. The same three lines recover the witness for any 'ending at i' DP.",
        "The tempting shortcut of taking the longest run of successive doublings, or of always including 1, is not a proof of optimality - the DP has to compare all divisors. That said, whenever 1 is present it can be prepended to any chain for free.",
        "Time: O(n^2) comparisons plus O(n log n) for the sort. Space: O(n).",
      ],
    },
    {
      name: "Maximum Length of Pair Chain",
      difficulty: "Medium",
      variation: "LIS on intervals, where greedy beats the DP",
      link: "https://leetcode.com/problems/maximum-length-of-pair-chain/",
      question: [
        "You are given an array of n pairs where pairs[i] = [left_i, right_i] and left_i < right_i. A pair p2 = [c, d] can follow a pair p1 = [a, b] if and only if b < c. A chain of pairs can be formed in this fashion. Return the length of the longest chain which can be formed. You do not need to use all the given pairs, and you may select the pairs in any order.",
        "Example 1:\nInput: pairs = [[1,2],[2,3],[3,4]]\nOutput: 2\nExplanation: [1,2] -> [3,4]. The pair [2,3] cannot follow [1,2] because 2 < 2 is false.",
        "Example 2:\nInput: pairs = [[1,2],[7,8],[4,5]]\nOutput: 3\nExplanation: [1,2] -> [4,5] -> [7,8].",
        "Constraints:\n- 1 <= n <= 1000\n- -1000 <= left_i < right_i <= 1000",
      ],
      code: `int findLongestChain(vector<vector<int>>& pairs) {
    // sort by right endpoint: the chain that ends earliest leaves the most room
    sort(pairs.begin(), pairs.end(), [](const vector<int>& a, const vector<int>& b) {
        return a[1] < b[1];
    });
    int count = 0, curEnd = INT_MIN;
    for (auto& p : pairs)
        if (p[0] > curEnd) {          // strict: b < c is required
            count++;
            curEnd = p[1];
        }
    return count;
}`,
      explanation: [
        "The pairs may be reordered, which is exactly what separates this from LIS. Since order is free, the problem is activity selection: pick the maximum number of mutually non-overlapping intervals. Sorting by right endpoint and greedily taking any interval that starts after the current end is optimal by the standard exchange argument - replacing the first chosen interval of an optimal solution with the one that finishes earliest never invalidates anything that came after it.",
        "If the pairs had to be used in the given order the greedy would be wrong and you would fall back to the O(n^2) LIS recurrence dp[i] = 1 + max dp[j] over j < i with pairs[j][1] < pairs[i][0]. Recognising which of the two situations you are in is the real skill this problem tests.",
        "Sorting by left endpoint instead is the classic wrong move: one very long interval starting first would be taken and would block everything behind it.",
        "The comparison must be strict. Using p[0] >= curEnd would accept [1,2] followed by [2,3], which the problem forbids.",
        "Time: O(n log n). Space: O(1) beyond the sort.",
      ],
    },
    {
      name: "Number of Longest Increasing Subsequence",
      difficulty: "Medium",
      variation: "Counting how many LIS achieve the maximum",
      link: "https://leetcode.com/problems/number-of-longest-increasing-subsequence/",
      question: [
        "Given an integer array nums, return the number of longest strictly increasing subsequences. Two subsequences are different if they use different sets of positions, even if the values coincide.",
        "Example 1:\nInput: nums = [1,3,5,4,7]\nOutput: 2\nExplanation: The two longest increasing subsequences are [1,3,4,7] and [1,3,5,7], both of length 4.",
        "Example 2:\nInput: nums = [2,2,2,2,2]\nOutput: 5\nExplanation: The longest increasing subsequence has length 1, and there are 5 single-element subsequences.",
        "Constraints:\n- 1 <= nums.length <= 2000\n- -10^6 <= nums[i] <= 10^6",
      ],
      code: `int findNumberOfLIS(vector<int>& nums) {
    int n = nums.size();
    vector<int> len(n, 1), cnt(n, 1);   // len[i] = LIS ending at i, cnt[i] = how many such
    int best = 1;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                if (len[j] + 1 > len[i]) {
                    len[i] = len[j] + 1;
                    cnt[i] = cnt[j];        // strictly better: discard the old count
                } else if (len[j] + 1 == len[i]) {
                    cnt[i] += cnt[j];       // ties accumulate
                }
            }
        }
        best = max(best, len[i]);
    }
    int total = 0;
    for (int i = 0; i < n; i++)
        if (len[i] == best) total += cnt[i];
    return total;
}`,
      explanation: [
        "Carry a second array alongside the length DP: cnt[i] counts the distinct longest increasing subsequences that end at index i. The two arrays must be updated together, because a longer subsequence invalidates every count collected so far for that index.",
        "The three-way branch is the entire correctness argument. len[j] + 1 > len[i] means every earlier predecessor was worse, so their counts are irrelevant and cnt[i] is reset to cnt[j]. Equality means j offers another independent way to reach the same length, so the counts add. Anything less contributes nothing.",
        "The final answer sums cnt[i] over every i whose len[i] equals the global maximum. Subsequences ending at different indices are automatically distinct because their last position differs, so there is no double counting - and taking just one such i is the classic mistake.",
        "The O(n log n) patience version does not extend to counting without extra machinery (a Fenwick tree keyed by value, storing both max length and a count). At n = 2000 the quadratic DP is the right call.",
        "Time: O(n^2). Space: O(n).",
      ],
    },
    {
      name: "Best Team With No Conflicts",
      difficulty: "Medium",
      variation: "Maximum-sum increasing subsequence (weighted LIS)",
      link: "https://leetcode.com/problems/best-team-with-no-conflicts/",
      question: [
        "You are the manager of a basketball team and want to pick the highest-scoring team with no conflicts. A conflict exists if a younger player has a strictly higher score than an older player; players of the same age never conflict with each other regardless of score. Given two arrays scores and ages, where scores[i] and ages[i] describe the i-th player, return the highest overall score of all possible conflict-free teams.",
        "Example 1:\nInput: scores = [1,3,5,10,15], ages = [1,2,3,4,5]\nOutput: 34\nExplanation: Age and score increase together, so no pair conflicts and the whole squad is legal: 1+3+5+10+15 = 34.",
        "Example 2:\nInput: scores = [4,5,6,5], ages = [2,1,2,1]\nOutput: 16\nExplanation: The two 1-year-olds with score 5 plus the 2-year-old with score 6 give 5+5+6 = 16. Adding the 2-year-old with score 4 would conflict with the younger score-5 players.",
        "Constraints:\n- 1 <= scores.length == ages.length <= 1000\n- 1 <= scores[i] <= 10^6\n- 1 <= ages[i] <= 1000",
      ],
      code: `int bestTeamScore(vector<int>& scores, vector<int>& ages) {
    int n = scores.size();
    vector<pair<int, int>> p(n);
    for (int i = 0; i < n; i++) p[i] = {ages[i], scores[i]};
    sort(p.begin(), p.end());   // by age, then by score
    vector<int> dp(n);
    int best = 0;
    for (int i = 0; i < n; i++) {
        dp[i] = p[i].second;
        for (int j = 0; j < i; j++)
            if (p[j].second <= p[i].second)   // non-decreasing score is conflict-free
                dp[i] = max(dp[i], dp[j] + p[i].second);
        best = max(best, dp[i]);
    }
    return best;
}`,
      explanation: [
        "Restating the rule removes the puzzle: a team is legal exactly when, listed in non-decreasing age order, the scores are also non-decreasing. So sort by (age, score) and find the maximum-sum non-decreasing subsequence of scores. The objective changes from count to sum, the recurrence does not.",
        "Sorting by score as the secondary key is what makes equal ages safe. Same-age players never conflict, and after that sort they appear in non-decreasing score order, so the non-decreasing test admits any subset of them - which is precisely the intended freedom.",
        "The comparison must be <= rather than <, because equal scores are allowed. Example 2 hinges on that: the two players with score 5 must both be selectable.",
        "dp[i] is initialised to p[i].second, not 0, so that a player who follows nobody still forms a team of one. Since all scores are positive the answer never wants to be empty.",
        "Time: O(n^2) after an O(n log n) sort. Space: O(n).",
      ],
    },
    {
      name: "Find the Longest Valid Obstacle Course at Each Position",
      difficulty: "Hard",
      variation: "Non-decreasing LIS, answer at every prefix",
      link: "https://leetcode.com/problems/find-the-longest-valid-obstacle-course-at-each-position/",
      question: [
        "You want to build obstacle courses. You are given an array obstacles of length n, where obstacles[i] is the height of the i-th obstacle. For every index i, find the length of the longest obstacle course built from obstacles[0..i] such that the chosen obstacles appear in the original order, the course ends with obstacles[i], and every obstacle is at least as tall as the one before it. Return an array of these n answers.",
        "Example 1:\nInput: obstacles = [1,2,3,2]\nOutput: [1,2,3,3]\nExplanation: Index 3 ends with height 2 and the best course is [1,2,2], of length 3.",
        "Example 2:\nInput: obstacles = [2,2,1]\nOutput: [1,2,1]\nExplanation: Index 1 uses [2,2], which is valid because heights may be equal. Index 2 ends at height 1, and nothing smaller precedes it, so only [1] works.",
        "Constraints:\n- n == obstacles.length\n- 1 <= n <= 10^5\n- 1 <= obstacles[i] <= 10^7",
      ],
      code: `vector<int> longestObstacleCourseAtEachPosition(vector<int>& obstacles) {
    vector<int> tails, ans;
    ans.reserve(obstacles.size());
    for (int x : obstacles) {
        // non-decreasing allowed -> upper_bound, so an equal value still extends
        auto it = upper_bound(tails.begin(), tails.end(), x);
        int pos = it - tails.begin();
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
        ans.push_back(pos + 1);   // x sits at index pos, i.e. course length pos + 1
    }
    return ans;
}`,
      explanation: [
        "This is the patience algorithm read differently. Normally you only report tails.size() at the end; here the insertion position itself is the answer, because landing at index pos means x extends some valid course of length pos and none longer.",
        "Correctness of the per-index answer rests on the same invariant as plain LIS: tails[k] is the smallest tail achievable for length k+1 over the prefix seen so far. If tails[pos-1] <= x then a course of length pos can be extended by x, and if x could reach length pos+2 then tails[pos] would already have been <= x, contradicting where upper_bound stopped.",
        "Because the course must end at obstacles[i], the answer is reported before any later element can disturb it - the loop is naturally online, one output per input.",
        "upper_bound versus lower_bound is the only real decision. Equal heights are permitted, so an equal value must be treated as extendable; lower_bound would make the sequence strict and undercount every plateau. The O(n^2) DP is correct but times out at n = 10^5.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Russian Doll Envelopes",
      difficulty: "Hard",
      variation: "Two-dimensional LIS via a sort trick",
      link: "https://leetcode.com/problems/russian-doll-envelopes/",
      question: [
        "You are given a 2D array of envelopes where envelopes[i] = [w_i, h_i] gives the width and height of envelope i. One envelope fits inside another if and only if both its width and its height are strictly smaller. Return the maximum number of envelopes you can nest, Russian-doll style. Rotation is not allowed.",
        "Example 1:\nInput: envelopes = [[5,4],[6,4],[6,7],[2,3]]\nOutput: 3\nExplanation: [2,3] fits in [5,4], which fits in [6,7].",
        "Example 2:\nInput: envelopes = [[1,1],[1,1],[1,1]]\nOutput: 1\nExplanation: Identical envelopes cannot nest, since nesting requires both dimensions to be strictly smaller.",
        "Constraints:\n- 1 <= envelopes.length <= 10^5\n- envelopes[i].length == 2\n- 1 <= w_i, h_i <= 10^5",
      ],
      code: `int maxEnvelopes(vector<vector<int>>& envelopes) {
    sort(envelopes.begin(), envelopes.end(), [](const vector<int>& a, const vector<int>& b) {
        // width ascending, but equal widths get heights DESCENDING
        return a[0] != b[0] ? a[0] < b[0] : a[1] > b[1];
    });
    vector<int> tails;
    for (auto& e : envelopes) {
        auto it = lower_bound(tails.begin(), tails.end(), e[1]);   // strict LIS on heights
        if (it == tails.end()) tails.push_back(e[1]);
        else *it = e[1];
    }
    return (int)tails.size();
}`,
      explanation: [
        "Sorting by width reduces one dimension to position, so any nesting chain must be left to right in the sorted order, and the surviving requirement is a strictly increasing subsequence of heights. That is exactly LIS.",
        "The descending tie-break on height is the trick and the only subtle line. Two envelopes of equal width can never nest, so they must not be allowed to appear together in the increasing-height subsequence. Listing equal widths with heights descending makes their heights a decreasing run, and a strictly increasing subsequence can pick at most one element from a decreasing run. Ascending tie-break would happily nest [3,4] inside [3,7], which is illegal.",
        "Once the tie-break handles equal widths, the height pass can use lower_bound without further thought; the strictness there enforces the strict height requirement.",
        "The O(n^2) pairwise DP is correct and easier to reason about, but at n = 10^5 it is 10^10 comparisons, so the patience version is mandatory. Extending the same idea to three dimensions does not work - that needs a Fenwick tree or divide and conquer, because no single sort can linearise two remaining dimensions.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "Minimum Number of Removals to Make Mountain Array",
      difficulty: "Hard",
      variation: "Bitonic LIS - increasing prefix meets decreasing suffix",
      link: "https://leetcode.com/problems/minimum-number-of-removals-to-make-mountain-array/",
      question: [
        "An array is a mountain array if its length is at least 3 and there exists an index i with 0 < i < arr.length - 1 such that arr[0] < arr[1] < ... < arr[i] and arr[i] > arr[i+1] > ... > arr[arr.length - 1]. Given an integer array nums, return the minimum number of elements to remove so that the remaining array is a mountain array.",
        "Example 1:\nInput: nums = [1,3,1]\nOutput: 0\nExplanation: The array is already a mountain array with peak 3.",
        "Example 2:\nInput: nums = [2,1,1,5,6,2,3,1]\nOutput: 3\nExplanation: Remove the elements at indices 0, 1 and 5 to leave [1,5,6,3,1], which rises to the peak 6 and then falls.",
        "Constraints:\n- 3 <= nums.length <= 1000\n- 1 <= nums[i] <= 10^9\n- It is guaranteed that a mountain array can be formed from nums",
      ],
      code: `int minimumMountainRemovals(vector<int>& nums) {
    int n = nums.size();
    vector<int> inc(n, 1), dec(n, 1);   // strictly increasing ending at i / starting at i
    for (int i = 0; i < n; i++)
        for (int j = 0; j < i; j++)
            if (nums[j] < nums[i]) inc[i] = max(inc[i], inc[j] + 1);
    for (int i = n - 1; i >= 0; i--)
        for (int j = n - 1; j > i; j--)
            if (nums[j] < nums[i]) dec[i] = max(dec[i], dec[j] + 1);
    int best = 0;
    for (int i = 0; i < n; i++)
        if (inc[i] > 1 && dec[i] > 1)   // a peak needs at least one element on each side
            best = max(best, inc[i] + dec[i] - 1);
    return n - best;
}`,
      explanation: [
        "Minimising removals is maximising what stays, so the task is to find the longest mountain-shaped subsequence. A mountain is determined by its peak, so try every index as the peak: the best mountain peaking at i keeps the longest strictly increasing subsequence ending at i plus the longest strictly decreasing subsequence starting at i, and nums[i] is counted in both, hence the minus one.",
        "The two halves are independent given the peak. Everything chosen on the left is at a position before i with values below nums[i], everything on the right is after i with values below nums[i], so no choice on one side constrains the other. dec is just inc run on the reversed array.",
        "The guard inc[i] > 1 && dec[i] > 1 is the trap. Without it, a purely increasing array reports its own last element as a peak with an empty descent, and the function returns a mountain that has no downslope. The definition demands 0 < i < n-1, i.e. at least one strictly smaller element on each side.",
        "Both passes must use strict comparisons - a mountain has no plateau, so equal neighbours are not allowed on either slope.",
        "Time: O(n^2). Space: O(n).",
      ],
    },
  ],
};
