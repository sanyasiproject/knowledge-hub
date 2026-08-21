import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Hamming Distance",
      difficulty: "Easy",
      variation: "Bit differences between two numbers",
      link: "https://leetcode.com/problems/hamming-distance/",
      question: [
        "The Hamming distance between two integers is the number of bit positions in which they differ. Given two integers x and y, return the Hamming distance between them.",
        "Example 1:\nInput: x = 1, y = 4\nOutput: 2\nExplanation: 1 = 0001 and 4 = 0100 differ in two positions.",
        "Constraints:\n- 0 <= x, y <= 2^31 - 1",
      ],
      code: `int hammingDistance(int x, int y) {
    return __builtin_popcount((unsigned)(x ^ y));
}`,
      explanation: [
        "XOR sets exactly the bits where x and y differ, so the answer is the population count of x ^ y. The builtin compiles to a single hardware instruction on modern CPUs.",
        "Time: O(1). Space: O(1).",
      ],
    },
    {
      name: "Find XOR of Numbers from 1 to n",
      difficulty: "Easy",
      variation: "Closed-form prefix XOR",
      link: "https://www.geeksforgeeks.org/calculate-xor-1-n/",
      question: [
        "Given a number n, compute 1 ^ 2 ^ 3 ^ ... ^ n without iterating over the numbers.",
        "Example 1:\nInput: n = 6\nOutput: 7\nExplanation: 1^2^3^4^5^6 = 7.",
        "Example 2:\nInput: n = 7\nOutput: 0",
        "Constraints:\n- 0 <= n <= 10^18",
      ],
      code: `long long xorUpTo(long long n) {
    switch (n % 4) {
        case 0: return n;
        case 1: return 1;
        case 2: return n + 1;
        default: return 0;
    }
}`,
      explanation: [
        "Pairs of the form (2k, 2k+1) XOR to 1, so the running XOR cycles with period 4: it equals n when n % 4 == 0, then 1, then n + 1, then 0. This follows by induction — each block of four consecutive integers XORs to 0.",
        "The closed form answers queries for n up to 10^18 in constant time, which is the foundation for all range-XOR computations.",
        "Time: O(1). Space: O(1).",
      ],
    },
    {
      name: "XOR of Range [L, R]",
      difficulty: "Easy",
      variation: "Prefix trick: f(R) ^ f(L-1)",
      question: [
        "Given two integers L and R with L <= R, compute L ^ (L+1) ^ ... ^ R without looping over the range.",
        "Example 1:\nInput: L = 4, R = 7\nOutput: 0\nExplanation: 4^5^6^7 = 0.",
        "Example 2:\nInput: L = 3, R = 9\nOutput: 2",
        "Constraints:\n- 0 <= L <= R <= 10^18",
      ],
      code: `long long xorUpTo(long long n) {
    if (n < 0) return 0;
    switch (n % 4) {
        case 0: return n;
        case 1: return 1;
        case 2: return n + 1;
        default: return 0;
    }
}

long long xorOfRange(long long l, long long r) {
    return xorUpTo(r) ^ xorUpTo(l - 1);
}`,
      explanation: [
        "XOR is its own inverse, so the XOR of [L, R] equals (XOR of [0, R]) ^ (XOR of [0, L-1]): the shared prefix [0, L-1] appears in both and cancels out. Each prefix comes from the period-4 closed form.",
        "The guard for n < 0 handles L = 0 cleanly.",
        "Time: O(1). Space: O(1).",
      ],
    },
    {
      name: "Counting Bits",
      difficulty: "Easy",
      variation: "Popcount DP over a prefix of integers",
      link: "https://leetcode.com/problems/counting-bits/",
      question: [
        "Given an integer n, return an array ans of length n + 1 such that ans[i] is the number of 1 bits in the binary representation of i, for every 0 <= i <= n.",
        "Example 1:\nInput: n = 5\nOutput: [0,1,1,2,1,2]",
        "Constraints:\n- 0 <= n <= 10^5",
      ],
      code: `vector<int> countBits(int n) {
    vector<int> ans(n + 1, 0);
    for (int i = 1; i <= n; i++)
        ans[i] = ans[i >> 1] + (i & 1);
    return ans;
}`,
      explanation: [
        "Dropping the lowest bit of i gives i >> 1, whose popcount is already computed, and the dropped bit contributes i & 1. This recurrence fills the whole table in one pass.",
        "It is the per-number counterpart of range bit aggregation and a common building block for bit-contribution arguments.",
        "Time: O(n). Space: O(n) for the output.",
      ],
    },
    {
      name: "Bitwise AND of Numbers Range",
      difficulty: "Medium",
      variation: "Common binary prefix of L and R",
      link: "https://leetcode.com/problems/bitwise-and-of-numbers-range/",
      question: [
        "Given two integers left and right with left <= right, return the bitwise AND of all numbers in the inclusive range [left, right].",
        "Example 1:\nInput: left = 5, right = 7\nOutput: 4",
        "Example 2:\nInput: left = 1, right = 2147483647\nOutput: 0",
        "Constraints:\n- 0 <= left <= right <= 2^31 - 1",
      ],
      code: `int rangeBitwiseAnd(int left, int right) {
    int shift = 0;
    while (left < right) {
        left >>= 1;
        right >>= 1;
        shift++;
    }
    return left << shift;
}`,
      explanation: [
        "Below the highest bit where left and right differ, every bit pattern occurs somewhere in the range (some number in between has a 0 there), so those bits AND to 0. What survives is exactly the common binary prefix of left and right.",
        "Right-shifting both until they are equal strips the differing suffix; shifting back restores the prefix with zeros below it.",
        "Time: O(log R). Space: O(1).",
      ],
    },
    {
      name: "Bitwise OR of Range [L, R]",
      difficulty: "Medium",
      variation: "Common prefix plus saturated suffix",
      question: [
        "Given two integers L and R with L <= R, compute the bitwise OR of every integer in the inclusive range [L, R] without looping over the range.",
        "Example 1:\nInput: L = 5, R = 6\nOutput: 7\nExplanation: 101 | 110 = 111.",
        "Example 2:\nInput: L = 8, R = 8\nOutput: 8",
        "Constraints:\n- 0 <= L <= R <= 10^18",
      ],
      code: `long long orOfRange(long long l, long long r) {
    if (l == r) return l;
    int shift = 0;
    long long a = l, b = r;
    while (a < b) {
        a >>= 1;
        b >>= 1;
        shift++;
    }
    return (a << shift) | ((1LL << shift) - 1);
}`,
      explanation: [
        "This is the dual of range AND. Below the highest differing bit of L and R, every bit position takes the value 1 somewhere in the range (crossing the boundary in that position flips it), so all those bits OR to 1, while the common prefix passes through unchanged.",
        "Stripping the suffix by shifting until the bounds agree finds the prefix; OR-ing back a mask of shift ones saturates the suffix.",
        "Time: O(log R). Space: O(1).",
      ],
    },
    {
      name: "Count Total Set Bits from 1 to n",
      difficulty: "Medium",
      variation: "Per-bit periodic counting",
      link: "https://www.geeksforgeeks.org/count-total-set-bits-in-all-numbers-from-1-to-n/",
      question: [
        "Given a positive integer n, count the total number of set bits in the binary representations of all numbers from 1 to n.",
        "Example 1:\nInput: n = 3\nOutput: 4\nExplanation: 1 (one bit) + 2 (one bit) + 3 (two bits) = 4.",
        "Example 2:\nInput: n = 6\nOutput: 9",
        "Constraints:\n- 1 <= n <= 10^18",
      ],
      code: `long long countSetBits(long long n) {
    long long count = 0;
    for (int b = 0; (1LL << b) <= n; b++) {
        long long cycle = 1LL << (b + 1);
        long long half = 1LL << b;
        long long full = (n + 1) / cycle * half;
        long long rem = (n + 1) % cycle;
        count += full + max(0LL, rem - half);
    }
    return count;
}`,
      explanation: [
        "Bit b over the integers 0, 1, 2, ... follows a period of 2^(b+1): first 2^b zeros, then 2^b ones. Among the n + 1 numbers 0..n, complete periods contribute 2^b ones each, and the partial period contributes whatever spills past its zero half.",
        "Summing this closed form over all bit positions counts every set bit in the range exactly once; including 0 is harmless since it has no set bits.",
        "Time: O(log n). Space: O(1).",
      ],
    },
    {
      name: "Count Set Bits in Range [L, R]",
      difficulty: "Medium",
      variation: "Prefix subtraction of bit counts",
      question: [
        "Given two integers L and R with L <= R, count the total number of set bits in the binary representations of all integers in the inclusive range [L, R], without iterating over the range.",
        "Example 1:\nInput: L = 2, R = 4\nOutput: 4\nExplanation: 10, 11, 100 contain 1 + 2 + 1 = 4 set bits.",
        "Constraints:\n- 0 <= L <= R <= 10^18",
      ],
      code: `long long countSetBits(long long n) {
    if (n < 0) return 0;
    long long count = 0;
    for (int b = 0; (1LL << b) <= n; b++) {
        long long cycle = 1LL << (b + 1);
        long long half = 1LL << b;
        long long full = (n + 1) / cycle * half;
        long long rem = (n + 1) % cycle;
        count += full + max(0LL, rem - half);
    }
    return count;
}

long long countSetBitsInRange(long long l, long long r) {
    return countSetBits(r) - countSetBits(l - 1);
}`,
      explanation: [
        "Set-bit totals are additive over disjoint ranges, so the count over [L, R] is the prefix count up to R minus the prefix count up to L - 1 — the same prefix-subtraction pattern as range XOR.",
        "Each prefix is computed per bit position using the periodic structure of that bit (period 2^(b+1), half zeros then half ones).",
        "Time: O(log R). Space: O(1).",
      ],
    },
    {
      name: "Count Numbers in [L, R] with the k-th Bit Set",
      difficulty: "Medium",
      variation: "Single-bit periodic counting",
      question: [
        "Given integers L, R (L <= R) and a bit index k (0-based), count how many integers x in the inclusive range [L, R] have bit k set, without iterating over the range.",
        "Example 1:\nInput: L = 0, R = 10, k = 1\nOutput: 5\nExplanation: 2, 3, 6, 7, 10 have bit 1 set.",
        "Constraints:\n- 0 <= L <= R <= 10^18\n- 0 <= k <= 62",
      ],
      code: `long long countKthBitUpTo(long long n, int k) {
    if (n < 0) return 0;
    long long cycle = 1LL << (k + 1);
    long long half = 1LL << k;
    long long full = (n + 1) / cycle * half;
    long long rem = (n + 1) % cycle;
    return full + max(0LL, rem - half);
}

long long countKthBitInRange(long long l, long long r, int k) {
    return countKthBitUpTo(r, k) - countKthBitUpTo(l - 1, k);
}`,
      explanation: [
        "Bit k of consecutive integers repeats with period 2^(k+1): 2^k numbers with the bit clear followed by 2^k with it set. Counting over a prefix [0, n] is a division plus a clamp on the partial period, and the range answer is the difference of two prefixes.",
        "This per-bit counter is the primitive from which total-set-bit counts, weighted bit sums, and digit-DP-style range counts are assembled.",
        "Time: O(1) per query. Space: O(1).",
      ],
    },
    {
      name: "Total Hamming Distance",
      difficulty: "Medium",
      variation: "Bit-contribution over all pairs",
      link: "https://leetcode.com/problems/total-hamming-distance/",
      question: [
        "Given an integer array nums, return the sum of Hamming distances between all pairs of the integers in nums.",
        "Example 1:\nInput: nums = [4,14,2]\nOutput: 6\nExplanation: d(4,14) + d(4,2) + d(14,2) = 2 + 2 + 2 = 6.",
        "Constraints:\n- 1 <= nums.length <= 10^4\n- 0 <= nums[i] <= 10^9",
      ],
      code: `int totalHammingDistance(vector<int>& nums) {
    int n = nums.size(), total = 0;
    for (int b = 0; b < 30; b++) {
        int ones = 0;
        for (int x : nums) ones += (x >> b) & 1;
        total += ones * (n - ones);
    }
    return total;
}`,
      explanation: [
        "Process each bit position independently: a pair differs at bit b exactly when one number has a 1 and the other a 0 there, so position b contributes ones * zeros to the total. Summing over the 30 relevant positions counts every differing bit of every pair exactly once.",
        "This bit-contribution decomposition replaces the O(n^2) pairwise scan with a per-bit tally.",
        "Time: O(30n). Space: O(1).",
      ],
    },
    {
      name: "Sum of XOR of All Pairs",
      difficulty: "Medium",
      variation: "Weighted bit-contribution",
      question: [
        "Given an array of n non-negative integers, compute the sum of a[i] XOR a[j] over all pairs i < j, without enumerating every pair explicitly per bit value.",
        "Example 1:\nInput: a = [5, 9, 7]\nOutput: 26\nExplanation: (5^9) + (5^7) + (9^7) = 12 + 2 + 14 = 26.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= a[i] < 2^30",
      ],
      code: `long long sumXorAllPairs(vector<int>& a) {
    int n = a.size();
    long long total = 0;
    for (int b = 0; b < 30; b++) {
        long long ones = 0;
        for (int x : a) ones += (x >> b) & 1;
        total += ones * (n - ones) * (1LL << b);
    }
    return total;
}`,
      explanation: [
        "For each bit b, a pair's XOR has that bit set exactly when the two numbers disagree there, which happens for ones * (n - ones) pairs; each such pair adds 2^b to the sum. Summing the weighted per-bit contributions equals summing all pairwise XOR values.",
        "This is the same tally as Total Hamming Distance with each position weighted by its place value, so it needs 64-bit accumulation.",
        "Time: O(30n). Space: O(1).",
      ],
    },
    {
      name: "Sum of AND of All Pairs",
      difficulty: "Medium",
      variation: "Choose-two bit-contribution",
      question: [
        "Given an array of n non-negative integers, compute the sum of a[i] AND a[j] over all pairs i < j.",
        "Example 1:\nInput: a = [5, 10, 15]\nOutput: 15\nExplanation: (5&10) + (5&15) + (10&15) = 0 + 5 + 10 = 15.",
        "Constraints:\n- 1 <= n <= 10^5\n- 0 <= a[i] < 2^30",
      ],
      code: `long long sumAndAllPairs(vector<int>& a) {
    long long total = 0;
    for (int b = 0; b < 30; b++) {
        long long ones = 0;
        for (int x : a) ones += (x >> b) & 1;
        total += ones * (ones - 1) / 2 * (1LL << b);
    }
    return total;
}`,
      explanation: [
        "Bit b survives an AND only when both numbers have it set, so among the 'ones' numbers with bit b set there are C(ones, 2) contributing pairs, each adding 2^b. Independence of bit positions makes the per-bit sums add up to the full answer.",
        "The same template handles OR of all pairs by counting pairs where at least one number has the bit: C(n,2) - C(zeros,2).",
        "Time: O(30n). Space: O(1).",
      ],
    },
    {
      name: "XOR Queries of a Subarray",
      difficulty: "Medium",
      variation: "Prefix XOR for many range queries",
      link: "https://leetcode.com/problems/xor-queries-of-a-subarray/",
      question: [
        "You are given an array arr of positive integers and queries[i] = [left_i, right_i]. For each query, compute the XOR of the elements from index left_i to right_i inclusive, and return the array of answers.",
        "Example 1:\nInput: arr = [1,3,4,8], queries = [[0,1],[1,2],[0,3],[3,3]]\nOutput: [2,7,14,8]",
        "Constraints:\n- 1 <= arr.length, queries.length <= 3 * 10^4\n- 1 <= arr[i] <= 10^9\n- 0 <= left_i <= right_i < arr.length",
      ],
      code: `vector<int> xorQueries(vector<int>& arr, vector<vector<int>>& queries) {
    int n = arr.size();
    vector<int> prefix(n + 1, 0);
    for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] ^ arr[i];
    vector<int> ans;
    ans.reserve(queries.size());
    for (auto& q : queries)
        ans.push_back(prefix[q[1] + 1] ^ prefix[q[0]]);
    return ans;
}`,
      explanation: [
        "Precompute prefix[i] = XOR of the first i elements. Because XOR is associative and self-inverse, the XOR of arr[l..r] is prefix[r+1] ^ prefix[l]: the shared prefix before l cancels.",
        "This is the array analogue of computing XOR over a numeric range [L, R] via f(R) ^ f(L-1), turning each query into O(1).",
        "Time: O(n + q). Space: O(n).",
      ],
    },
  ],
};
