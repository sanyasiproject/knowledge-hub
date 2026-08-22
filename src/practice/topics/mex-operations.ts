import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Missing Number",
      difficulty: "Easy",
      variation: "MEX of n distinct values from 0..n, the template",
      link: "https://leetcode.com/problems/missing-number/",
      question: [
        "Given an array nums containing n distinct numbers taken from the range 0..n, return the only number in that range that is missing from the array. Equivalently, return the MEX (minimum excluded value) of the set, which here is the single absent value.",
        "Example 1:\nInput: nums = [3,0,1]\nOutput: 2\nExplanation: n = 3, so the range is 0..3. The values 0, 1 and 3 are present, so the smallest missing non-negative value is 2.",
        "Example 2:\nInput: nums = [9,6,4,2,3,5,7,0,1]\nOutput: 8\nExplanation: n = 9, the sum of 0..9 is 45 and the array sums to 37, so the missing value is 8.",
        "Constraints:\n- 1 <= n <= 10^4\n- 0 <= nums[i] <= n\n- All values in nums are distinct",
      ],
      code: `int missingNumber(vector<int>& nums) {
    int n = nums.size();
    long long total = (long long)n * (n + 1) / 2;   // sum of 0..n, 64-bit to be safe
    for (int x : nums) total -= x;
    return (int)total;
}`,
      explanation: [
        "The general way to compute a MEX is: mark which small values are present in a boolean array of size n+1, then scan from 0 upward and return the first index that is unmarked. That is O(n) time and O(n) space and it is the pattern every harder problem in this topic specialises.",
        "This particular instance is tighter than the general case: exactly one value from 0..n is absent, so the answer is forced and no scan is needed. Subtracting the array from the closed-form sum of 0..n leaves precisely the missing value.",
        "The XOR variant (xor together 0..n and every element) is equally valid and avoids overflow entirely, which is the reason it is often preferred. The trap is to reach for the sum trick on problems where more than one value can be missing - there the closed form tells you nothing and you must fall back to the presence array.",
        "Sorting first also works but costs O(n log n) for no benefit, and using a hash set costs the same asymptotics as the presence array with a much worse constant, since the keys are already bounded by n.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Subset Mex",
      difficulty: "Easy",
      variation: "Split a multiset to maximise the sum of two MEXes",
      link: "https://codeforces.com/problemset/problem/1406/A",
      question: [
        "You are given a multiset of n non-negative integers. Distribute every element into one of two multisets A or B (each element goes to exactly one of them, and either may be left empty). Maximise mex(A) + mex(B), where mex of a multiset is the smallest non-negative integer that does not occur in it. Print that maximum. There are t independent test cases.",
        "Example 1:\nInput:\n2\n6\n0 2 1 5 0 1\n3\n0 1 2\nOutput:\n5\n3\nExplanation: In the first case counts are 0->2, 1->2, 2->1, 5->1. Put 0,1,2 into A for mex(A) = 3 and the spare 0,1 into B for mex(B) = 2, total 5. In the second case every value is single, so one set takes 0,1,2 for mex 3 and the other is empty with mex 0.",
        "Example 2:\nInput:\n1\n4\n0 2 0 1\nOutput:\n4\nExplanation: A = {0,1,2} gives mex 3 and B = {0} gives mex 1, total 4.",
        "Constraints:\n- 1 <= t <= 100\n- 1 <= n <= 100\n- 0 <= a[i] <= 100",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        vector<int> cnt(205, 0);        // values are bounded by 100, so a fixed table is enough
        for (int i = 0; i < n; i++) {
            int x;
            cin >> x;
            cnt[x]++;
        }
        int p = 0;
        while (cnt[p] > 0) p++;         // first value absent altogether
        int q = 0;
        while (cnt[q] > 1) q++;         // first value with fewer than two copies
        cout << p + q << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Think about what mex(A) = x demands: A must contain one copy of each of 0..x-1. So achieving mex(A) = x and mex(B) = y at the same time demands two copies of every value below min(x, y) and one copy of every value below max(x, y).",
        "That makes the optimum forced. Let p be the smallest value with count zero - no set can ever reach a MEX above p, so the larger of the two MEXes is at most p, and giving one copy of 0..p-1 to A attains exactly p. Let q be the smallest value with count below two - the smaller MEX is at most q, and the second copies of 0..q-1 attain it. Note q <= p automatically, because a count of zero is also a count below two.",
        "The tempting wrong move is to sort and split the multiset in half, or to alternate elements between A and B. Neither respects the fact that the answer depends only on multiplicities, not on order or on balancing sizes.",
        "Leftover elements above q or duplicates beyond the second copy are simply dumped anywhere: they can never lower a MEX, since a MEX only depends on which values are present.",
        "Time: O(n + V) per test case where V is the value bound. Space: O(V).",
      ],
    },
    {
      name: "Maximum Number of Consecutive Values You Can Make",
      difficulty: "Medium",
      variation: "MEX of the set of subset sums",
      link: "https://leetcode.com/problems/maximum-number-of-consecutive-values-you-can-make/",
      question: [
        "You are given an integer array coins of length n. A value v is makeable if some sub-multiset of coins sums to exactly v (the empty selection makes 0). Return the number of consecutive integer values starting at 0 that are makeable. Equivalently, if m is the MEX of the set of achievable subset sums, return m.",
        "Example 1:\nInput: coins = [1,3]\nOutput: 2\nExplanation: 0 and 1 are makeable, 2 is not, so two consecutive values starting from 0.",
        "Example 2:\nInput: coins = [1,1,1,4]\nOutput: 8\nExplanation: The three ones cover 0..3, then adding the 4 extends the run to 0..7, so eight values and the first gap is at 8.",
        "Constraints:\n- 1 <= coins.length <= 4 * 10^4\n- 1 <= coins[i] <= 4 * 10^4",
      ],
      code: `int getMaximumConsecutive(vector<int>& coins) {
    sort(coins.begin(), coins.end());
    int reach = 0;                      // every value in 0..reach is makeable
    for (int c : coins) {
        if (c > reach + 1) break;       // a gap at reach+1 can never be filled by larger coins
        reach += c;
    }
    return reach + 1;                   // count of values 0..reach
}`,
      explanation: [
        "The invariant carried through the sorted scan is: after processing a prefix of the coins, every value in 0..reach is makeable and reach+1 is the MEX of the sums built so far. Initially reach = 0, since only the empty selection exists.",
        "Adding a coin c with c <= reach+1 extends the interval to 0..reach+c and keeps it gap-free: values up to reach are old, and any target v in reach+1..reach+c is made by taking c plus a subset summing to v-c, which lies in 0..reach because v-c <= reach and v-c >= reach+1-c >= 0. If instead c > reach+1, then reach+1 cannot be represented at all - it is smaller than every remaining coin, and the coins already used top out at reach - so the MEX is fixed and the scan stops.",
        "Sorting is what makes the greedy sound. Processing coins in arbitrary order can reject a coin that only looks too large because a small coin has not been consumed yet, for example [4,1,1,1] would stop immediately and answer 1 instead of 8.",
        "A subset-sum DP over a bitset also solves this and is the fallback when the question asks which sums are makeable rather than only where the first gap is; the greedy is O(n log n) instead of O(n * sum).",
        "Time: O(n log n) for the sort. Space: O(1) beyond the input.",
      ],
    },
    {
      name: "Smallest Missing Non-negative Integer After Operations",
      difficulty: "Medium",
      variation: "MEX over residue classes",
      link: "https://leetcode.com/problems/smallest-missing-non-negative-integer-after-operations/",
      question: [
        "You are given an integer array nums and an integer value. In one operation you may pick any index i and either add value to nums[i] or subtract value from nums[i]; you may perform any number of operations. The MEX of the array is the smallest non-negative integer that is not present in it. Return the maximum MEX you can achieve.",
        "Example 1:\nInput: nums = [1,-10,7,13,6,8], value = 5\nOutput: 4\nExplanation: The residues modulo 5 are 1, 0, 2, 3, 1, 3, so residue class 4 is empty and 0,1,2,3 can each be produced. The MEX is therefore 4.",
        "Example 2:\nInput: nums = [1,-10,7,13,6,8], value = 7\nOutput: 2\nExplanation: The residues modulo 7 are 1, 4, 0, 6, 6, 1. Class 0 supplies 0 and class 1 supplies 1, but no element sits in class 2, so 2 can never be produced.",
        "Constraints:\n- 1 <= nums.length, value <= 10^5\n- -10^9 <= nums[i] <= 10^9",
      ],
      code: `int findSmallestInteger(vector<int>& nums, int value) {
    vector<int> cnt(value, 0);
    for (int x : nums) cnt[((x % value) + value) % value]++;   // C++ % keeps the sign, so normalise
    for (int i = 0;; i++) {
        int r = i % value;
        if (cnt[r] == 0) return i;      // no element left in this residue class
        cnt[r]--;                       // spend one element to cover the value i
    }
}`,
      explanation: [
        "Adding or subtracting value never changes an element's residue modulo value, and inside its residue class an element can be moved to any non-negative representative. So the array is fully described by the multiset of residues, and the target values 0, 1, 2, ... consume residue classes 0, 1, ..., value-1, 0, 1, ... in that cyclic order.",
        "Building the answer greedily upward is therefore exact: to place the value i you need one unused element from class i mod value, and elements within a class are interchangeable so it never matters which one you take. The first i with an exhausted class is the MEX, and no strategy beats it because covering that i is impossible by the pigeonhole argument on class sizes.",
        "The closed form is the same statement counted differently: if the smallest class count is c and r is the smallest residue attaining it, the answer is c * value + r. The loop is easier to get right and runs in the same time, since it terminates after at most n + 1 iterations.",
        "Two traps. First, the sign of the built-in modulo: -10 % 5 is 0 in C++ but -10 % 7 is -3, so the residue must be normalised or the index is negative. Second, negative values are not a special case at all - they are freely liftable into the non-negative range, so no filtering of negatives is needed.",
        "Time: O(n + value). Space: O(value).",
      ],
    },
    {
      name: "Mex Min",
      difficulty: "Medium",
      variation: "Minimum MEX over every sliding window of length K",
      link: "https://atcoder.jp/contests/abc194/tasks/abc194_e",
      question: [
        "You are given a sequence A of length N and an integer K. For each of the N-K+1 contiguous windows of length K, compute the MEX of that window (the smallest non-negative integer not appearing inside it). Print the minimum of those MEX values.",
        "Example 1:\nInput:\n3 2\n0 0 1\nOutput: 1\nExplanation: The window [0,0] misses 1 so its MEX is 1; the window [0,1] has MEX 2. The minimum is 1.",
        "Example 2:\nInput:\n5 3\n0 1 2 0 1\nOutput: 3\nExplanation: All three windows of length 3 contain 0, 1 and 2 and miss 3, so every MEX is 3.",
        "Constraints:\n- 1 <= K <= N <= 1.5 * 10^5\n- 0 <= A[i] < N",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k;
    cin >> n >> k;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    vector<int> cnt(n + 2, 0);
    set<int> absent;                                  // values 0..n not in the current window
    for (int v = 0; v <= n; v++) absent.insert(v);
    for (int i = 0; i < k; i++) {
        if (cnt[a[i]]++ == 0) absent.erase(a[i]);
    }
    int ans = *absent.begin();
    for (int i = k; i < n; i++) {
        int out = a[i - k];
        if (--cnt[out] == 0) absent.insert(out);      // value left the window entirely
        int in = a[i];
        if (cnt[in]++ == 0) absent.erase(in);
        ans = min(ans, *absent.begin());
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "The MEX of a window is the smallest element of the complement of that window inside 0..n, so maintain the complement explicitly. An ordered set of absent values gives the MEX as its first element in O(1), and the window slide touches only two values.",
        "The counter array is what makes the set correct under duplicates: a value becomes absent only when its multiplicity in the window drops to zero, and becomes present only on the transition from zero to one. Erasing on every removal without counting would wrongly declare a value missing while another copy is still inside the window.",
        "Only values 0..K can ever be the MEX of a K-element window, and inserting 0..n covers that with room to spare, so the set is never empty and no boundary check is needed.",
        "An alternative is a segment tree over values storing the last position where each value occurred, then a descent for the leftmost value whose last occurrence is before the window start. Same complexity, more code; the ordered set is the natural fit here because the window changes by one element at a time.",
        "Time: O(N log N). Space: O(N).",
      ],
    },
    {
      name: "Stick Game",
      difficulty: "Medium",
      variation: "MEX inside a Grundy / win-lose recurrence",
      question: [
        "There is a pile of n sticks and a set of k allowed move sizes p[1..k]. Two players alternate turns; on a turn a player removes exactly p[i] sticks for some i (a move is legal only if that many sticks remain). The player who cannot move loses. For every pile size 1..n, determine whether the player to move wins. Print a string of n characters where character x is 'W' if the first player wins with a pile of x sticks and 'L' otherwise.",
        "Example 1:\nInput:\n10 2\n2 3\nOutput: LWWWLLWWWL\nExplanation: With moves of 2 and 3, piles of size 1, 5, 6 and 10 are losing for the mover. From 5 both moves lead to 3 and 2, which are winning for the opponent.",
        "Example 2:\nInput:\n4 1\n1\nOutput: WLWL\nExplanation: Removing one stick each turn, odd piles are wins and even piles are losses for the player to move.",
        "Constraints:\n- 1 <= n <= 10^6\n- 1 <= k <= 100\n- 1 <= p[i] <= n",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k;
    cin >> n >> k;
    vector<int> p(k);
    for (int i = 0; i < k; i++) cin >> p[i];
    vector<char> win(n + 1, 0);         // win[0] = 0: no move available, mover loses
    string res(n, 'L');
    for (int x = 1; x <= n; x++) {
        for (int i = 0; i < k; i++) {
            if (p[i] <= x && !win[x - p[i]]) {   // a move into a losing state exists
                win[x] = 1;
                break;
            }
        }
        res[x - 1] = win[x] ? 'W' : 'L';
    }
    cout << res << "\\n";
    return 0;
}`,
      explanation: [
        "This is the MEX recurrence in its most reduced form. The Grundy value of a position is g(x) = mex of the Grundy values of the positions reachable in one move, and a position is losing for the mover exactly when g(x) = 0. Since g(x) = 0 means 0 is not among the reachable Grundy values, and g(x) > 0 means 0 is reachable, the whole computation collapses to the boolean 'some move leads to a losing state'.",
        "The base case follows from the same definition: from x = 0 the reachable set is empty and mex of the empty set is 0, so a pile of zero sticks is a loss for whoever must move. Every larger state depends only on strictly smaller ones, so a single increasing sweep resolves them all.",
        "The boolean reduction is only valid for a single game. The moment the position is a sum of independent games - several piles played simultaneously - you need the real Grundy numbers, because the sum's value is the XOR of the components' Grundy values and a win-lose flag cannot be XORed. That is the standard trap when moving from this problem to Sprague-Grundy proper.",
        "Note the answers become periodic quickly for a fixed move set, which is a useful sanity check when debugging, but the periodicity is not needed here since the sweep is already linear in n * k.",
        "Time: O(n * k). Space: O(n).",
      ],
    },
    {
      name: "First Missing Positive",
      difficulty: "Hard",
      variation: "MEX of the positive integers in O(1) extra space",
      link: "https://leetcode.com/problems/first-missing-positive/",
      question: [
        "Given an unsorted integer array nums, return the smallest positive integer that does not appear in it. The array may contain duplicates, zeros and negative numbers. You must solve it in O(n) time and use only O(1) auxiliary space, so the input array itself has to carry the bookkeeping.",
        "Example 1:\nInput: nums = [3,4,-1,1]\nOutput: 2\nExplanation: 1 is present, 2 is not.",
        "Example 2:\nInput: nums = [7,8,9,11,12]\nOutput: 1\nExplanation: No value in 1..5 is present, so the answer is the smallest candidate, 1.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -2^31 <= nums[i] <= 2^31 - 1",
      ],
      code: `int firstMissingPositive(vector<int>& nums) {
    int n = nums.size();
    for (int i = 0; i < n; i++) {
        // send each value v in 1..n to index v-1; the guard stops duplicate cycles
        while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {
            swap(nums[i], nums[nums[i] - 1]);
        }
    }
    for (int i = 0; i < n; i++) {
        if (nums[i] != i + 1) return i + 1;
    }
    return n + 1;
}`,
      explanation: [
        "The answer is always in 1..n+1, because n slots cannot hold all of 1..n+1. So only the values 1..n matter and the array of n cells is exactly big enough to serve as the presence table - that is the whole idea behind doing it in place.",
        "Cyclic placement puts value v at index v-1 by repeated swapping. Each swap moves at least one value into its final home and a value already at home is never disturbed, so the total number of swaps is bounded by n and the doubly nested loop is still linear. Values outside 1..n, and duplicates whose home is already occupied by an equal value, are simply left where they are - the condition nums[nums[i]-1] != nums[i] is what stops an infinite swap loop on duplicates.",
        "After the placement pass, index i holds i+1 if and only if i+1 is present, so the first index that disagrees gives the MEX directly, and a fully consistent array means 1..n are all present and the answer is n+1.",
        "The tempting O(n) time approaches that fail the space bound are a hash set or an auxiliary boolean array of size n+1. There is also a sign-marking variant - after clamping out-of-range entries, negate nums[v-1] to record that v was seen - which is equally correct and avoids swapping, at the cost of destroying the original values.",
        "Time: O(n) amortised. Space: O(1).",
      ],
    },
    {
      name: "MEX and Increments",
      difficulty: "Hard",
      variation: "Cheapest way to force the MEX to each target value",
      question: [
        "You are given an array a of n non-negative integers. In one operation you may pick any element and increase it by 1. For every k from 0 to n, print the minimum number of operations needed to make the MEX of the array equal exactly k, or -1 if it is impossible.",
        "Example 1:\nInput:\n3\n0 0 0\nOutput: 3 0 1 3\nExplanation: For k = 0 every zero must be pushed off zero, costing 3. For k = 1 the array already contains 0 and no 1, so 0 operations. For k = 2 raise one spare zero to 1, costing 1. For k = 3 raise one zero to 1 and another to 2, costing 3.",
        "Example 2:\nInput:\n3\n1 3 4\nOutput: 0 -1 -1 -1\nExplanation: The MEX is already 0 because no zero is present, and since elements can only grow, a 0 can never be created, so every larger target is impossible.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 0 <= a[i] <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<long long> cnt(n + 2, 0);
    for (int i = 0; i < n; i++) {
        long long x;
        cin >> x;
        if (x <= n) cnt[x]++;           // values above n can neither block nor help
    }
    vector<long long> spare;            // stack of surplus copies, values non-decreasing
    long long base = 0;                 // cost to make 0..k-1 all present
    bool ok = true;
    for (int k = 0; k <= n; k++) {
        if (ok) cout << base + cnt[k] << " ";   // extra cost: push every copy of k off k
        else cout << -1 << " ";
        if (cnt[k] == 0) {
            if (spare.empty()) ok = false;      // nothing can ever be raised to k
            else {
                base += k - spare.back();       // lift the largest available surplus
                spare.pop_back();
            }
        } else {
            for (long long j = 1; j < cnt[k]; j++) spare.push_back(k);
        }
    }
    cout << "\\n";
    return 0;
}`,
      explanation: [
        "Split the cost of the target mex = k into two independent halves. First, every value 0..k-1 must be present, which costs something that only grows with k; call it base. Second, no element may equal k, and since operations only increase values, each of the cnt[k] copies of k must be bumped by exactly 1, costing cnt[k]. The two halves never interfere, because the elements bumped off k land on k+1 and above, which is outside 0..k-1.",
        "base is built incrementally by sweeping k upward. If k already occurs, one copy stays put and the extra cnt[k]-1 copies become surplus that could be raised later. If k does not occur, some surplus element must be raised to k, and taking the largest available surplus value is optimal: the cost of using surplus value s is k - s, all surplus values are candidates for all later gaps, and the exchange argument says pairing the largest surplus with the smallest gap never loses. Because the sweep meets gaps in increasing order and surpluses are pushed in increasing order, a stack gives that largest-first choice in O(1).",
        "Impossibility is monotone: once a gap cannot be filled, no later target can be reached either, so a single flag suffices. Values above n are irrelevant on both counts - they are too large to be raised into any gap below n cheaply enough to matter, since they cannot be decreased at all, and they never equal a target k <= n.",
        "The tempting wrong greedy is to fill each gap with the nearest surplus below it, which looks locally cheap but strands large surpluses that only the later, larger gaps could have used efficiently. Note also that answers reach about n^2 / 4 operations, so the accumulator must be 64-bit.",
        "Time: O(n). Space: O(n).",
      ],
    },
    {
      name: "Complicated Computations",
      difficulty: "Hard",
      variation: "MEX of the multiset of MEXes of all subarrays",
      link: "https://codeforces.com/problemset/problem/1436/E",
      question: [
        "You are given an array a of n positive integers. Consider every contiguous subarray of a and compute its MEX, where MEX here means the smallest positive integer that does not occur in that subarray. Collect all of those MEX values into a multiset and print the MEX of that multiset.",
        "Example 1:\nInput:\n3\n1 3 2\nOutput: 3\nExplanation: The subarray MEXes are 2, 1, 1, 2, 1 and 4, so the set of achieved values is {1, 2, 4} and the smallest positive value missing from it is 3.",
        "Example 2:\nInput:\n2\n1 1\nOutput: 1\nExplanation: Every subarray consists only of ones, so every MEX is 2. The value 1 is never achieved.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= a[i] <= n",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    int m = n + 2;                            // leaves hold the last position of value 0..n+1
    vector<int> seg(2 * m, 0);
    auto update = [&](int pos, int val) {
        pos += m;
        seg[pos] = val;
        for (pos /= 2; pos >= 1; pos /= 2) seg[pos] = min(seg[2 * pos], seg[2 * pos + 1]);
    };
    auto query = [&](int l, int r) {          // min last-occurrence over values l..r
        int res = INT_MAX;
        if (l > r) return res;
        for (l += m, r += m + 1; l < r; l /= 2, r /= 2) {
            if (l & 1) res = min(res, seg[l++]);
            if (r & 1) res = min(res, seg[--r]);
        }
        return res;
    };
    vector<int> prevPos(n + 3, 0);            // last index where each value appeared
    vector<char> can(n + 3, 0);
    bool allOnes = true;
    for (int i = 1; i <= n; i++) {
        int k = a[i];
        if (k != 1) allOnes = false;
        // the maximal k-free block ending at i-1 is (prevPos[k], i-1]
        if (k >= 2 && query(1, k - 1) > prevPos[k]) can[k] = 1;
        update(k, i);
        prevPos[k] = i;
    }
    for (int k = 2; k <= n + 1; k++) {        // the k-free suffix block (prevPos[k], n]
        if (query(1, k - 1) > prevPos[k]) can[k] = 1;
    }
    can[1] = allOnes ? 0 : 1;                 // mex 1 needs any subarray without a 1
    int ans = 1;
    while (ans <= n + 2 && can[ans]) ans++;
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "There are O(n^2) subarrays, so nothing can enumerate them. Flip the question: instead of computing MEXes, decide for each candidate value k whether some subarray achieves it, then take the MEX of the achievable set. Since every a[i] >= 1 and the array has n elements, the only candidates are 1..n+1.",
        "A subarray has MEX exactly k when it contains every value 1..k-1 and no k. The subarrays free of k are precisely the sub-blocks of the maximal blocks between consecutive occurrences of k, and only the maximal blocks are worth testing: if a maximal block already fails to contain all of 1..k-1, none of its sub-blocks can. So for each value k, test each maximal k-free block, and the total number of blocks over all k is O(n).",
        "Testing a block [L, R] for 'contains every value 1..k-1' is a range-minimum query: sweep R left to right maintaining last[v], the most recent position of value v, and check that min over v in 1..k-1 of last[v] is at least L. A segment tree over the value axis answers each test in O(log n). The sweep order matters - update last[a[i]] only after testing the block that ends at i-1, otherwise the current element leaks into its own block.",
        "Two boundaries are easy to miss. Blocks ending at the array end are never triggered by an occurrence of k, so a final pass over all k is needed. And k = 1 falls outside the argument because the range 1..0 is empty: MEX 1 just needs one subarray with no 1 at all, which exists exactly when some element differs from 1.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
    {
      name: "MEX Queries",
      difficulty: "Hard",
      variation: "MEX of a set maintained under range add, remove and invert",
      link: "https://codeforces.com/problemset/problem/817/F",
      question: [
        "You start with an empty set of positive integers and must process n queries. Query type 1 l r adds every missing integer of [l, r] to the set, type 2 l r removes every present integer of [l, r], and type 3 l r inverts [l, r] - every present integer of that range is removed and every missing one is added. After each query print the MEX of the set, meaning the smallest positive integer it does not contain.",
        "Example 1:\nInput:\n3\n1 3 4\n3 1 6\n2 1 3\nOutput:\n1\n3\n1\nExplanation: After the first query the set is {3,4} and 1 is missing. Inverting [1,6] leaves {1,2,5,6}, so the answer is 3. Removing [1,3] leaves {5,6} and the answer is 1 again.",
        "Example 2:\nInput:\n4\n1 1 3\n3 5 6\n2 4 4\n3 1 6\nOutput:\n4\n4\n4\n1\nExplanation: The set is {1,2,3}, then {1,2,3,5,6}, then unchanged since 4 was absent, and the final inversion of [1,6] leaves only {4}.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= l <= r <= 10^18\n- The query type is 1, 2 or 3",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> q;
    vector<int> tp(q);
    vector<long long> L(q), R(q), xs;
    xs.push_back(1);                          // 1 must be a candidate answer
    for (int i = 0; i < q; i++) {
        cin >> tp[i] >> L[i] >> R[i];
        xs.push_back(L[i]);
        xs.push_back(R[i] + 1);               // half-open endpoints keep the blocks uniform
    }
    sort(xs.begin(), xs.end());
    xs.erase(unique(xs.begin(), xs.end()), xs.end());
    int m = xs.size();
    vector<int> cnt(4 * m, 0), len(4 * m, 0), asg(4 * m, -1);
    vector<char> flp(4 * m, 0);
    function<void(int,int,int)> build = [&](int node, int l, int r) {
        len[node] = r - l + 1;
        if (l == r) return;
        int mid = (l + r) / 2;
        build(2 * node, l, mid);
        build(2 * node + 1, mid + 1, r);
    };
    build(1, 0, m - 1);
    auto doAssign = [&](int node, int v) {
        cnt[node] = v ? len[node] : 0;
        asg[node] = v;
        flp[node] = 0;                        // an assignment wipes any pending flip
    };
    auto doFlip = [&](int node) {
        cnt[node] = len[node] - cnt[node];
        if (asg[node] != -1) asg[node] ^= 1;  // flipping a pending assign is just the other assign
        else flp[node] ^= 1;
    };
    auto push = [&](int node) {
        if (asg[node] != -1) {
            doAssign(2 * node, asg[node]);
            doAssign(2 * node + 1, asg[node]);
            asg[node] = -1;
        }
        if (flp[node]) {
            doFlip(2 * node);
            doFlip(2 * node + 1);
            flp[node] = 0;
        }
    };
    function<void(int,int,int,int,int,int)> update =
        [&](int node, int l, int r, int ql, int qr, int t) {
        if (qr < l || r < ql) return;
        if (ql <= l && r <= qr) {
            if (t == 3) doFlip(node);
            else doAssign(node, t == 1 ? 1 : 0);
            return;
        }
        push(node);
        int mid = (l + r) / 2;
        update(2 * node, l, mid, ql, qr, t);
        update(2 * node + 1, mid + 1, r, ql, qr, t);
        cnt[node] = cnt[2 * node] + cnt[2 * node + 1];
    };
    function<int(int,int,int)> firstZero = [&](int node, int l, int r) {
        if (l == r) return l;
        push(node);
        int mid = (l + r) / 2;
        if (cnt[2 * node] < len[2 * node]) return firstZero(2 * node, l, mid);
        return firstZero(2 * node + 1, mid + 1, r);
    };
    for (int i = 0; i < q; i++) {
        int ql = lower_bound(xs.begin(), xs.end(), L[i]) - xs.begin();
        int qr = (int)(lower_bound(xs.begin(), xs.end(), R[i] + 1) - xs.begin()) - 1;
        update(1, 0, m - 1, ql, qr, tp[i]);
        cout << xs[firstZero(1, 0, m - 1)] << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Coordinates reach 10^18 so the integers cannot be stored one per leaf. Compress instead: collect 1, every l and every r+1, sort and deduplicate, and let leaf i stand for the whole interval [xs[i], xs[i+1] - 1] with the last leaf standing for [xs[m-1], infinity). Because every query boundary is a compression point, each query covers a whole run of leaves, so every leaf stays uniform - entirely in the set or entirely out - forever. That uniformity is the reason the MEX can be read off a leaf index.",
        "Storing r+1 rather than r is what makes the blocks half-open and keeps a query from ever splitting a leaf. Including 1 guarantees the answer 1 is representable even when no query touches it, and since the largest coordinate is some r+1 which is never itself covered, the final leaf is permanently absent and a zero always exists to be found.",
        "Each node keeps the number of present leaves under it plus two lazy tags: assign 0/1 and invert. The tags must be composed, not queued: an assignment arriving at a node discards any pending invert, while an invert arriving at a node with a pending assignment just toggles that assignment rather than being recorded separately. Getting this composition wrong is the classic bug in this problem, and it shows up only on inputs that mix type 3 with types 1 and 2.",
        "The answer is the leftmost leaf that is not present, found by a single root-to-leaf descent: go left whenever the left child is not completely full, otherwise go right. Because leaves are uniform, that leaf's left endpoint xs[i] is exactly the smallest positive integer missing from the set.",
        "The same structure answers the classic offline variant with a simpler tool - if only additions occur, a sorted structure or a DSU over value ranges is enough - but inversion forces the lazy segment tree.",
        "Time: O(n log n). Space: O(n).",
      ],
    },
  ],
};
