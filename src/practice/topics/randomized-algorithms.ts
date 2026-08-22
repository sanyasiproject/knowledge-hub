import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Majority Element",
      difficulty: "Easy",
      variation: "Las Vegas guess-and-check, the template",
      link: "https://leetcode.com/problems/majority-element/",
      question: [
        "Given an array nums of size n, return the majority element - the element that appears more than n / 2 times. You may assume that a majority element always exists in the array.",
        "Solve it with randomness: pick a candidate uniformly at random, verify it with one linear scan, and repeat until the check passes.",
        "Example 1:\nInput: nums = [3,2,3]\nOutput: 3\nExplanation: 3 appears twice out of three positions, and 2 > 3 / 2.",
        "Example 2:\nInput: nums = [2,2,1,1,1,2,2]\nOutput: 2\nExplanation: 2 appears four times out of seven, and 4 > 7 / 2.",
        "Constraints:\n- 1 <= nums.length <= 5 * 10^4\n- -10^9 <= nums[i] <= 10^9\n- A majority element is guaranteed to exist",
      ],
      code: `int majorityElement(vector<int>& nums) {
    int n = nums.size();
    static mt19937 rng(random_device{}());
    uniform_int_distribution<int> pick(0, n - 1);
    while (true) {
        int cand = nums[pick(rng)];          // guess
        int cnt = 0;
        for (int x : nums) if (x == cand) cnt++;
        if (cnt > n / 2) return cand;        // verify before committing
    }
}`,
      explanation: [
        "This is the shape of every Las Vegas algorithm: a cheap random guess plus a deterministic verifier. The answer returned is never wrong - only the running time is random - because nothing is returned until the linear scan proves the candidate really is a majority.",
        "More than half the positions hold the majority element, so a uniformly random index hits it with probability strictly greater than 1/2. The number of rounds is therefore geometric with p > 1/2, giving fewer than 2 rounds in expectation and a failure probability below 2^-k after k rounds.",
        "The trap is treating this as a Monte Carlo method and returning the first candidate whose count merely looks large, or sampling a fixed small number of indices and taking the mode. Both can be wrong on adversarial input; the verifier is what makes the randomness free.",
        "Boyer-Moore voting solves the same problem deterministically in one pass and O(1) space, so randomness is not needed here - the value of the exercise is that the guess-and-check skeleton generalises to problems where no deterministic trick exists.",
        "Time: O(n) expected. Space: O(1).",
      ],
    },
    {
      name: "Shuffle an Array",
      difficulty: "Medium",
      variation: "Fisher-Yates uniform permutation",
      link: "https://leetcode.com/problems/shuffle-an-array/",
      question: [
        "Given an integer array nums, design an algorithm to randomly shuffle it. All permutations of the array must be equally likely. Implement a class with a constructor taking nums, a method reset() that restores and returns the original configuration, and a method shuffle() that returns a random shuffling of the array.",
        "Example 1:\nInput: nums = [1,2,3], then the calls shuffle(), reset(), shuffle()\nOutput: [3,1,2], [1,2,3], [1,3,2]\nExplanation: shuffle() returns one of the six permutations of [1,2,3], each with probability 1/6; reset() must return exactly [1,2,3]; the next shuffle() is independent of the first.",
        "Constraints:\n- 1 <= nums.length <= 50\n- -10^6 <= nums[i] <= 10^6\n- At most 10^4 calls in total to reset and shuffle",
      ],
      code: `class Solution {
    vector<int> original, cur;
    mt19937 rng;

public:
    Solution(vector<int>& nums)
        : original(nums), cur(nums), rng(random_device{}()) {}

    vector<int> reset() {
        cur = original;
        return cur;
    }

    vector<int> shuffle() {
        for (int i = (int)cur.size() - 1; i > 0; i--) {
            // j is drawn from [0, i] INCLUSIVE - excluding i breaks uniformity
            int j = uniform_int_distribution<int>(0, i)(rng);
            swap(cur[i], cur[j]);
        }
        return cur;
    }
};`,
      explanation: [
        "Fisher-Yates builds the permutation from the back. At step i the suffix positions i+1..n-1 are already fixed, and the element that lands in position i is chosen uniformly from the i+1 elements still unplaced. Multiplying those independent choices gives 1/n * 1/(n-1) * ... * 1 = 1/n!, so every permutation is equally likely.",
        "The classic bug is drawing j from [0, n-1] instead of [0, i], or from [0, i-1]. The first produces n^n equally likely execution traces, and since n^n is not divisible by n! for n >= 3 the permutations cannot come out uniform (for n = 3 it visibly favours some orders). The second can never leave an element in place, so it generates only cyclic permutations.",
        "A second common mistake is sorting by a random key. That is uniform only if all keys are distinct, and with a small key range ties silently bias the result toward the comparator's tie-breaking order.",
        "Keeping the original vector separate is what makes reset() exact; shuffling in place over the only copy destroys it after the first call.",
        "Time: O(n) per shuffle, O(n) per reset. Space: O(n).",
      ],
    },
    {
      name: "Insert Delete GetRandom O(1)",
      difficulty: "Medium",
      variation: "Uniform sampling from a dynamic set",
      link: "https://leetcode.com/problems/insert-delete-getrandom-o1/",
      question: [
        "Implement a RandomizedSet class supporting insert(val) which inserts val if not present and returns whether it was inserted, remove(val) which removes val if present and returns whether it was removed, and getRandom() which returns a uniformly random element of the current set. Each operation must run in average O(1) time.",
        "Example 1:\nInput: the calls insert(1), remove(2), insert(2), getRandom(), remove(1), insert(2), getRandom()\nOutput: true, false, true, 1 or 2, true, false, 2\nExplanation: insert(1) succeeds; remove(2) fails since 2 is absent; insert(2) succeeds; the set is now {1,2} so getRandom() returns either with probability 1/2; remove(1) succeeds leaving {2}; insert(2) fails since 2 is present; getRandom() must now return 2.",
        "Constraints:\n- -2^31 <= val <= 2^31 - 1\n- At most 2 * 10^5 calls in total\n- getRandom is only called when the set is non-empty",
      ],
      code: `class RandomizedSet {
    vector<int> vals;                 // dense array, so an index draw is O(1)
    unordered_map<int,int> pos;       // value -> its index in vals
    mt19937 rng;

public:
    RandomizedSet() : rng(random_device{}()) {}

    bool insert(int val) {
        if (pos.count(val)) return false;
        pos[val] = vals.size();
        vals.push_back(val);
        return true;
    }

    bool remove(int val) {
        auto it = pos.find(val);
        if (it == pos.end()) return false;
        int idx = it->second, last = vals.back();
        vals[idx] = last;             // move the tail element into the hole
        pos[last] = idx;              // and fix its recorded index
        vals.pop_back();
        pos.erase(it);
        return true;
    }

    int getRandom() {
        return vals[uniform_int_distribution<int>(0, vals.size() - 1)(rng)];
    }
};`,
      explanation: [
        "Uniform sampling needs a contiguous index range, which a hash set alone cannot give. The fix is a pair of structures: a vector holding the elements densely so one random index is a uniform draw, and a hash map from value to index so membership and deletion stay O(1).",
        "The only interesting operation is remove. Erasing from the middle of a vector is O(n), so instead overwrite the hole with the last element and shrink by one. Order is destroyed, but the set does not care about order and the array stays dense, which is the invariant getRandom depends on.",
        "Two ordering traps live in remove. The tail element's index must be updated in the map, and pos.erase must come after that write - if val happens to be the last element, writing pos[last] = idx first and then erasing by iterator removes exactly the right entry, whereas erasing by key afterwards would delete the freshly written one.",
        "Time: O(1) expected per operation. Space: O(n).",
      ],
    },
    {
      name: "Linked List Random Node",
      difficulty: "Medium",
      variation: "Reservoir sampling, k = 1, unknown length",
      link: "https://leetcode.com/problems/linked-list-random-node/",
      question: [
        "Given a singly linked list, return the value of a random node from the list, with each node having an equal probability of being chosen. Solve it in one pass using O(1) extra space, without first computing the length of the list.",
        "Example 1:\nInput: the list 1 -> 2 -> 3, then three calls to getRandom()\nOutput: 1, 3, 2\nExplanation: every call returns one of the three values, each with probability 1/3, independently of the previous calls.",
        "Constraints:\n- The number of nodes is between 1 and 10^4\n- -10^4 <= Node.val <= 10^4\n- At most 10^4 calls to getRandom",
      ],
      code: `class Solution {
    ListNode* head;
    mt19937 rng;

public:
    Solution(ListNode* h) : head(h), rng(random_device{}()) {}

    int getRandom() {
        int res = 0, i = 0;
        for (ListNode* p = head; p; p = p->next) {
            i++;
            // keep the i-th node with probability exactly 1/i
            if (uniform_int_distribution<int>(1, i)(rng) == 1) res = p->val;
        }
        return res;
    }
};`,
      explanation: [
        "Reservoir sampling maintains the invariant that after scanning i nodes, the single stored value is uniform over those i nodes. It holds by induction: the new node is taken with probability 1/i, and any previously held node survives with probability (1/(i-1)) * (1 - 1/i) = 1/i.",
        "That invariant is what makes the length unnecessary. When the scan ends at i = n every node has probability exactly 1/n, so the algorithm is correct for a stream whose length is only discovered at the end - the defining use case for the technique.",
        "The tempting wrong version replaces with a fixed probability such as 1/2 at every step, which weights the tail of the list exponentially more than the head. Equally wrong is collecting all values into a vector: correct, but O(n) space, and useless on a genuine stream.",
        "For a reservoir of size k the rule generalises to: accept element i with probability k/i and, on acceptance, evict a uniformly random one of the k held items.",
        "Time: O(n) per call. Space: O(1).",
      ],
    },
    {
      name: "Random Pick Index",
      difficulty: "Medium",
      variation: "Reservoir sampling over matching positions",
      link: "https://leetcode.com/problems/random-pick-index/",
      question: [
        "Given an integer array nums with possible duplicates, implement the pick(target) method which returns a random index i such that nums[i] == target. If there are multiple valid indices, each must be returned with equal probability. It is guaranteed that target exists in the array. Use only O(1) extra space beyond the input.",
        "Example 1:\nInput: nums = [1,2,3,3,3], then pick(3), pick(1), pick(3)\nOutput: 4, 0, 2\nExplanation: pick(3) returns 2, 3 or 4, each with probability 1/3; pick(1) must return 0, the only index holding 1.",
        "Constraints:\n- 1 <= nums.length <= 2 * 10^4\n- -2^31 <= nums[i] <= 2^31 - 1\n- target is an integer that exists in nums\n- At most 10^4 calls to pick",
      ],
      code: `class Solution {
    vector<int> nums;
    mt19937 rng;

public:
    Solution(vector<int>& a) : nums(a), rng(random_device{}()) {}

    int pick(int target) {
        int res = -1, cnt = 0;
        for (int i = 0; i < (int)nums.size(); i++) {
            if (nums[i] != target) continue;
            cnt++;                                // this is the cnt-th match
            if (uniform_int_distribution<int>(1, cnt)(rng) == 1) res = i;
        }
        return res;
    }
};`,
      explanation: [
        "The same reservoir invariant as the linked-list version, but the stream is filtered: only positions equal to target advance the counter, so the sampling is uniform over the matching indices rather than over all indices.",
        "Because the counter only increments on a match, an element that is never a match cannot perturb the distribution, and the guarantee that target exists means cnt reaches at least 1 and res is always overwritten from its -1 sentinel.",
        "The obvious alternative is to precompute a hash map from value to a vector of its indices in the constructor and then draw one index directly. That is O(1) per pick and is the right answer when picks vastly outnumber construction, but it costs O(n) extra memory, which the O(1)-space version avoids at the cost of a scan per call.",
        "Time: O(n) per pick, O(1) construction. Space: O(1) beyond the stored input.",
      ],
    },
    {
      name: "Implement Rand10() Using Rand7()",
      difficulty: "Medium",
      variation: "Rejection sampling to change the range",
      link: "https://leetcode.com/problems/implement-rand10-using-rand7/",
      question: [
        "Given the API rand7() which generates a uniform random integer in the range [1, 7], write a function rand10() that generates a uniform random integer in the range [1, 10]. You may only call rand7() and must not use any other source of randomness. Each of the ten outcomes must be equally likely, and you should minimise the expected number of calls to rand7().",
        "Example 1:\nInput: n = 1\nOutput: [2]\nExplanation: one call to rand10() returned 2; any of 1..10 was equally likely.",
        "Example 2:\nInput: n = 3\nOutput: [3,8,10]\nExplanation: three independent calls to rand10().",
        "Constraints:\n- 1 <= n <= 10^5 (the number of times rand10 is called)\n- rand7() is uniform on [1, 7] and independent between calls",
      ],
      code: `int rand10() {
    while (true) {
        int a = rand7(), b = rand7();
        int idx = (a - 1) * 7 + b;          // uniform on [1, 49]
        if (idx <= 40) return (idx - 1) % 10 + 1;   // keep only a multiple of 10
    }
}`,
      explanation: [
        "Two independent rand7() calls give 49 equally likely pairs, which the mixed-radix expression (a-1)*7 + b maps bijectively onto [1, 49]. Uniformity of the pair therefore transfers exactly to idx.",
        "49 is not a multiple of 10, and no deterministic function of a uniform 49-way variable can be uniform on 10 values, because 10 does not divide 49. Rejection sampling resolves the mismatch: discard the 9 outcomes 41..49 and retry. Conditioned on acceptance, idx is uniform on [1, 40], and 40 splits evenly into ten blocks of four.",
        "The wrong-but-tempting shortcuts are idx % 10 + 1 over the whole [1, 49] range, which hands values 1..9 an extra chance, and folding rejects back in (for instance mapping 41..49 onto 1..9), which is the same bias in disguise. Retrying is the only way to keep the distribution exact.",
        "The retry probability is 9/49, so the expected number of rounds is 49/40 and the expected rand7() calls is about 2.45. Squeezing the leftover randomness from rejected draws lowers this toward the information-theoretic limit of log(10)/log(7), roughly 1.18 calls, but the simple version is what interviews want.",
        "Time: O(1) expected, 2.45 rand7() calls on average. Space: O(1).",
      ],
    },
    {
      name: "Random Pick with Weight",
      difficulty: "Medium",
      variation: "Weighted sampling by prefix sums",
      link: "https://leetcode.com/problems/random-pick-with-weight/",
      question: [
        "You are given a 0-indexed array of positive integers w where w[i] is the weight of index i. Implement pickIndex() which randomly picks an index in the range [0, w.length - 1] such that the probability of picking index i is w[i] divided by the sum of all the weights.",
        "Example 1:\nInput: w = [1], then one call to pickIndex()\nOutput: 0\nExplanation: index 0 is the only choice, so it is returned with probability 1.",
        "Example 2:\nInput: w = [1,3], then four calls to pickIndex()\nOutput: 1, 1, 1, 0\nExplanation: the total weight is 4, so index 0 has probability 1/4 and index 1 has probability 3/4.",
        "Constraints:\n- 1 <= w.length <= 10^4\n- 1 <= w[i] <= 10^5\n- pickIndex is called at most 10^4 times",
      ],
      code: `class Solution {
    vector<int> pre;                  // pre[i] = w[0] + ... + w[i]
    mt19937 rng;

public:
    Solution(vector<int>& w) : pre(w.size()), rng(random_device{}()) {
        partial_sum(w.begin(), w.end(), pre.begin());
    }

    int pickIndex() {
        int t = uniform_int_distribution<int>(1, pre.back())(rng);
        // first prefix sum >= t: index i owns the integers (pre[i-1], pre[i]]
        return lower_bound(pre.begin(), pre.end(), t) - pre.begin();
    }
};`,
      explanation: [
        "Lay the weights end to end on the integer line. Index i occupies the half-open block of w[i] consecutive integers ending at pre[i]. Drawing one integer uniformly from [1, total] and reporting which block contains it gives index i with probability exactly w[i] / total.",
        "Locating the block is a predecessor query on a sorted array, so binary search does it in O(log n) after an O(n) prefix-sum build. lower_bound is the right variant: it returns the first pre[i] >= t, which is precisely the owner of t, whereas upper_bound would skip past an exact block boundary and return the next index.",
        "Two traps: drawing t from [0, total] adds an impossible extra outcome and mis-attributes 0, and using floating-point weights with a real-valued draw invites rounding at the boundaries. Staying in integers keeps the distribution exact - with w[i] up to 10^5 and 10^4 entries the total is at most 10^9, which still fits in an int.",
        "The alias method reaches O(1) per pick after O(n) preprocessing and is the right tool when picks dominate; prefix sums plus binary search is simpler and fast enough at these limits.",
        "Time: O(n) construction, O(log n) per pick. Space: O(n).",
      ],
    },
    {
      name: "Kth Largest Element in an Array",
      difficulty: "Medium",
      variation: "Quickselect with a random pivot",
      link: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
      question: [
        "Given an integer array nums and an integer k, return the kth largest element in the array. Note that it is the kth largest in sorted order, not the kth distinct element. Solve it without fully sorting the array.",
        "Example 1:\nInput: nums = [3,2,1,5,6,4], k = 2\nOutput: 5\nExplanation: sorted descending the array is [6,5,4,3,2,1], and the 2nd entry is 5.",
        "Example 2:\nInput: nums = [3,2,3,1,2,4,5,5,6], k = 4\nOutput: 4\nExplanation: sorted descending it is [6,5,5,4,3,2,2,1], and the 4th entry is 4.",
        "Constraints:\n- 1 <= k <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4",
      ],
      code: `int findKthLargest(vector<int>& nums, int k) {
    int n = nums.size(), target = n - k;      // the kth largest sits here once sorted ascending
    static mt19937 rng(random_device{}());
    int lo = 0, hi = n - 1;
    while (lo < hi) {
        int pivot = nums[uniform_int_distribution<int>(lo, hi)(rng)];
        int i = lo, j = lo, g = hi;
        // three-way partition: [lo,i) < pivot, [i,j) == pivot, (g,hi] > pivot
        while (j <= g) {
            if (nums[j] < pivot) swap(nums[i++], nums[j++]);
            else if (nums[j] > pivot) swap(nums[j], nums[g--]);
            else j++;
        }
        if (target < i) hi = i - 1;           // recurse into one side only
        else if (target > g) lo = g + 1;
        else return pivot;                    // target landed in the equal block
    }
    return nums[lo];
}`,
      explanation: [
        "Quickselect is quicksort that throws away one side. After partitioning, the position of the pivot block is known exactly, so the target index is either inside it (answer found) or strictly on one side, and the other side is never touched again.",
        "Randomising the pivot is the whole point. With a fixed pivot such as the last element, a sorted or reverse-sorted input makes every partition shave off one element and the cost degrades to O(n^2) - and that input is exactly what an adversary or a real-world already-sorted dataset supplies. A uniformly random pivot splits the range so that the expected work forms the geometric series n + n/2 + n/4 + ... = O(n), with the bound holding regardless of input order because the randomness lives in the algorithm, not the data.",
        "The three-way partition matters for the second example's duplicates: a two-way Lomuto partition on an array of many equal keys still degrades to quadratic even with a random pivot, because equal elements all pile onto one side. Collapsing them into a middle block removes that case entirely.",
        "Note that O(n) here is expected, not worst case. Median-of-medians gives a deterministic O(n), and a heap of size k gives O(n log k) with the advantage of working on a stream; quickselect wins in practice on an in-memory array.",
        "Time: O(n) expected, O(n^2) worst case. Space: O(1), the recursion having been flattened into the loop.",
      ],
    },
    {
      name: "Sort an Array",
      difficulty: "Medium",
      variation: "Randomized quicksort, three-way partition",
      link: "https://leetcode.com/problems/sort-an-array/",
      question: [
        "Given an array of integers nums, sort the array in ascending order and return it. You must solve the problem without using any built-in sorting function, in O(n log n) time and with the smallest space complexity possible.",
        "Example 1:\nInput: nums = [5,2,3,1]\nOutput: [1,2,3,5]",
        "Example 2:\nInput: nums = [5,1,1,2,0,0]\nOutput: [0,0,1,1,2,5]\nExplanation: duplicates are kept; only the order changes.",
        "Constraints:\n- 1 <= nums.length <= 5 * 10^4\n- -5 * 10^4 <= nums[i] <= 5 * 10^4",
      ],
      code: `class Solution {
    mt19937 rng{random_device{}()};

    void qs(vector<int>& a, int lo, int hi) {
        while (lo < hi) {
            int pivot = a[uniform_int_distribution<int>(lo, hi)(rng)];
            int i = lo, j = lo, g = hi;
            while (j <= g) {                       // Dutch national flag
                if (a[j] < pivot) swap(a[i++], a[j++]);
                else if (a[j] > pivot) swap(a[j], a[g--]);
                else j++;
            }
            // recurse on the smaller side, iterate on the larger: stack stays O(log n)
            if (i - lo < hi - g) { qs(a, lo, i - 1); lo = g + 1; }
            else { qs(a, g + 1, hi); hi = i - 1; }
        }
    }

public:
    vector<int> sortArray(vector<int>& nums) {
        qs(nums, 0, (int)nums.size() - 1);
        return nums;
    }
};`,
      explanation: [
        "Each partition places the whole block of pivot-equal elements in its final sorted position, so the two remaining ranges are independent and sorting them finishes the job. That is the invariant; the recursion needs no merge step, unlike mergesort.",
        "The random pivot converts quicksort's worst case from an input property into a probability. Any single fixed pivot rule - first, last, middle - has a family of inputs that forces O(n^2), and those inputs are easy to construct deliberately and common accidentally (already-sorted data). Drawing the pivot uniformly makes the expected comparison count 2n ln n for every input, and the chance of exceeding a constant multiple of n log n falls off polynomially in n.",
        "Two robustness details. The three-way partition makes arrays with few distinct values linear rather than quadratic, which the second example hints at. Recursing into the smaller side and looping on the larger caps stack depth at O(log n), so a hostile split cannot overflow the stack even when it costs time.",
        "This sort is not stable, and the pivot value must be copied out before partitioning - holding an index instead breaks as soon as a swap moves the pivot element.",
        "Time: O(n log n) expected. Space: O(log n) for the recursion stack.",
      ],
    },
    {
      name: "Random Pick with Blacklist",
      difficulty: "Hard",
      variation: "Sampling a set with holes by remapping",
      link: "https://leetcode.com/problems/random-pick-with-blacklist/",
      question: [
        "You are given an integer n and an array of unique integers blacklist, where all values in blacklist lie in the range [0, n - 1]. Design an algorithm that picks an integer uniformly at random from the range [0, n - 1] that is not in blacklist. Any such integer must be equally likely. Optimise for as few calls to the random number generator as possible, and use memory proportional to the size of blacklist rather than to n.",
        "Example 1:\nInput: n = 7, blacklist = [2,3,5], then four calls to pick()\nOutput: 0, 4, 1, 6\nExplanation: the legal values are {0,1,4,6}, each returned with probability 1/4.",
        "Example 2:\nInput: n = 4, blacklist = [0,1], then two calls to pick()\nOutput: 3, 2\nExplanation: the legal values are {2,3}, each with probability 1/2.",
        "Constraints:\n- 1 <= n <= 10^9\n- 0 <= blacklist.length <= min(10^5, n - 1)\n- 0 <= blacklist[i] < n and all values are distinct",
      ],
      code: `class Solution {
    int m;                            // number of allowed values
    unordered_map<int,int> remap;     // blacklisted value below m -> a legal value at or above m
    mt19937 rng;

public:
    Solution(int n, vector<int>& blacklist) : rng(random_device{}()) {
        m = n - (int)blacklist.size();
        unordered_set<int> bad(blacklist.begin(), blacklist.end());
        int last = n - 1;
        for (int b : blacklist) {
            if (b >= m) continue;             // outside the draw range, needs no slot
            while (bad.count(last)) last--;   // find a legal value in the tail
            remap[b] = last--;
        }
    }

    int pick() {
        int x = uniform_int_distribution<int>(0, m - 1)(rng);
        auto it = remap.find(x);
        return it == remap.end() ? x : it->second;
    }
};`,
      explanation: [
        "The goal is one random draw per pick, which requires a contiguous range. Let m = n - blacklist.size() be the number of legal values. Exactly m values are legal overall, so draw from [0, m) and repair the mismatch: every blacklisted value below m is given a private forwarding address pointing at a distinct legal value at or above m.",
        "The counting argument is what makes it exact. The number of blacklisted values below m equals the number of legal values at or above m, so the forwarding is a bijection and each of the m draws lands on a distinct legal value. Uniform on [0, m) therefore becomes uniform on the legal set.",
        "The tempting approach is rejection sampling: draw from [0, n) and retry on a blacklisted hit. That is correct but its expected number of draws is n / m, which explodes when the blacklist covers almost the whole range - with n = 10^5 and 10^5 - 1 blacklisted values it takes 10^5 draws per pick. Remapping is O(1) draws unconditionally.",
        "Building a full allow-list array is the other trap: correct, but n reaches 10^9 so it cannot be allocated. Memory here is O(blacklist.length), independent of n.",
        "Time: O(B) construction, O(1) expected per pick. Space: O(B) where B is the blacklist size.",
      ],
    },
    {
      name: "Primality Test (Miller-Rabin)",
      difficulty: "Hard",
      variation: "Monte Carlo witness test with random bases",
      question: [
        "Given an integer n, decide whether it is prime. The value of n can be as large as 10^18, so trial division up to the square root - about 10^9 operations - is too slow. Implement the randomized Miller-Rabin test: repeatedly pick a random base and check a necessary condition for primality, declaring n prime only if every base agrees.",
        "Example 1:\nInput: n = 2147483647\nOutput: true\nExplanation: 2^31 - 1 is the Mersenne prime M31, so no base can witness compositeness.",
        "Example 2:\nInput: n = 1000000005\nOutput: false\nExplanation: it ends in 5, so it is divisible by 5 and the small-prime screen rejects it before any random base is drawn.",
        "Constraints:\n- 1 <= n < 2^63\n- Use 128-bit intermediate arithmetic; a 64-bit multiplication of two values near 10^18 overflows",
      ],
      code: `bool isPrime(unsigned long long n) {
    if (n < 2) return false;
    for (unsigned long long p : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL,
                                 23ULL, 29ULL, 31ULL, 37ULL}) {
        if (n % p == 0) return n == p;        // screens out the small cases first
    }
    unsigned long long d = n - 1;
    int s = 0;
    while ((d & 1) == 0) { d >>= 1; s++; }    // n - 1 = d * 2^s with d odd

    auto mulmod = [&](unsigned long long a, unsigned long long b) {
        return (unsigned long long)((__uint128_t)a * b % n);   // 128-bit to avoid overflow
    };
    auto powmod = [&](unsigned long long a, unsigned long long e) {
        unsigned long long r = 1;
        while (e) {
            if (e & 1) r = mulmod(r, a);
            a = mulmod(a, a);
            e >>= 1;
        }
        return r;
    };

    static mt19937_64 rng(random_device{}());
    for (int it = 0; it < 30; it++) {
        unsigned long long a = uniform_int_distribution<unsigned long long>(2, n - 2)(rng);
        unsigned long long x = powmod(a, d);
        if (x == 1 || x == n - 1) continue;   // this base sees nothing suspicious
        bool witness = true;
        for (int r = 1; r < s; r++) {
            x = mulmod(x, x);
            if (x == n - 1) { witness = false; break; }
        }
        if (witness) return false;            // a proves n composite
    }
    return true;
}`,
      explanation: [
        "Write n - 1 = d * 2^s with d odd. If n is prime, Fermat gives a^(n-1) = 1 mod n, and because a prime modulus has no nontrivial square roots of 1 the sequence a^d, a^2d, a^4d, ..., a^(n-1) must either start at 1 or hit n - 1 before reaching 1. A base for which neither happens is a proof - a witness - that n is composite.",
        "The asymmetry is the key to reading the result. A single witness is conclusive: the answer 'composite' is never wrong. The answer 'prime' is the probabilistic side, since a composite might get lucky. Rabin's theorem bounds the liars: at most 1/4 of the bases in [2, n-2] fail to witness a composite n, so k independent random bases leave an error probability below 4^-k, under 10^-18 at k = 30. This is Monte Carlo, the mirror image of the Las Vegas structure in the majority-element problem.",
        "Skipping the strong test and checking only a^(n-1) = 1 mod n is the classic error. That is the Fermat test, and the Carmichael numbers - 561, 1105, 1729 and infinitely many more - pass it for every base coprime to n, so its error probability does not shrink with more bases. The extra squaring loop looking for n - 1 is exactly what closes that hole.",
        "The other trap is arithmetic: a * b with a, b near 10^18 overflows 64 bits and silently returns garbage, so every modular multiply must widen to __uint128_t (or use Montgomery multiplication when speed matters).",
        "In competitive use the random bases are usually replaced by the fixed set 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, which is proven to decide every n below 3.3 * 10^24 deterministically. Random bases remain the right choice when the input range is unbounded or an adversary knows your code.",
        "Time: O(k log^3 n) bit operations, effectively O(k log n) 128-bit multiplications. Space: O(1).",
      ],
    },
    {
      name: "Longest Duplicate Substring",
      difficulty: "Hard",
      variation: "Randomized hash base against anti-hash tests",
      link: "https://leetcode.com/problems/longest-duplicate-substring/",
      question: [
        "Given a string s, consider all duplicated substrings - contiguous substrings of s that occur two or more times, possibly overlapping. Return any duplicated substring of the longest possible length. If s does not contain a duplicated substring, return the empty string.",
        "Example 1:\nInput: s = 'banana'\nOutput: 'ana'\nExplanation: 'ana' occurs at positions 1 and 3, overlapping; no substring of length 4 repeats.",
        "Example 2:\nInput: s = 'abcd'\nOutput: ''\nExplanation: every character is distinct, so not even a substring of length 1 repeats.",
        "Constraints:\n- 2 <= s.length <= 3 * 10^4\n- s consists of lowercase English letters",
      ],
      code: `class Solution {
public:
    string longestDupSubstring(string s) {
        int n = s.size();
        const unsigned long long MOD = (1ULL << 61) - 1;      // a Mersenne prime
        mt19937_64 rng(random_device{}());
        // the base is drawn at run time, so no fixed input can be built to break it
        unsigned long long base = uniform_int_distribution<unsigned long long>(300, MOD - 2)(rng);

        auto mul = [&](unsigned long long a, unsigned long long b) {
            __uint128_t c = (__uint128_t)a * b;
            // 2^61 == 1 mod MOD, so folding the high bits down replaces a division
            unsigned long long r = (unsigned long long)(c & MOD) + (unsigned long long)(c >> 61);
            return r >= MOD ? r - MOD : r;
        };

        auto check = [&](int L) {
            unsigned long long h = 0, pw = 1;
            for (int i = 0; i < L; i++) {
                h = mul(h, base) + (unsigned char)s[i];
                if (h >= MOD) h -= MOD;
                pw = mul(pw, base);                            // base^L
            }
            unordered_map<unsigned long long, vector<int>> seen;
            seen[h].push_back(0);
            for (int i = L; i < n; i++) {
                h = mul(h, base) + (unsigned char)s[i];         // append s[i]
                if (h >= MOD) h -= MOD;
                h = h + MOD - mul(pw, (unsigned char)s[i - L]); // drop s[i-L]
                if (h >= MOD) h -= MOD;
                int st = i - L + 1;
                auto& bucket = seen[h];
                for (int p : bucket) {
                    // verify the real characters, so a collision can never produce a wrong answer
                    if (s.compare(p, L, s, st, L) == 0) return st;
                }
                bucket.push_back(st);
            }
            return -1;
        };

        int lo = 1, hi = n - 1, bestStart = -1, bestLen = 0;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            int st = check(mid);
            if (st >= 0) { bestStart = st; bestLen = mid; lo = mid + 1; }
            else hi = mid - 1;
        }
        return bestLen == 0 ? string() : s.substr(bestStart, bestLen);
    }
};`,
      explanation: [
        "The answer length is monotone: if some substring of length L repeats, then so does its prefix of length L - 1. That makes the predicate 'a duplicate of length L exists' false-then-true in one direction and binary searchable, reducing the problem to answering that predicate for a single L.",
        "For a fixed L, slide a rolling hash over the n - L + 1 windows and bucket the hashes. Each window's hash is obtained from the previous one in O(1) by appending the new character and subtracting the outgoing one scaled by base^L, so the whole check costs O(n).",
        "This is the topic's real lesson: the base is drawn at run time. A hash with a hard-coded base is a deterministic function, and for any published base an adversary can construct a Thue-Morse style string that forces enormous numbers of collisions - the standard anti-hash attack that fails many submissions on Codeforces. Randomising the base means the attacker must beat a function chosen after their input was fixed, which drops the collision probability to roughly n^2 / MOD by the Schwartz-Zippel argument.",
        "Modulus choice matters just as much: 2^61 - 1 is prime and large enough that n^2 / MOD is around 10^-12 here, whereas a 32-bit or power-of-two modulus collides by birthday paradox at only tens of thousands of windows. The explicit character-by-character verification on a hash hit then makes the algorithm Las Vegas rather than Monte Carlo - the returned substring is always genuinely duplicated, and only the running time depends on luck.",
        "A suffix automaton or a suffix array with LCP solves this deterministically in O(n) or O(n log n), but both are far longer to write than a randomized rolling hash.",
        "Time: O(n log n) expected. Space: O(n).",
      ],
    },
  ],
};
