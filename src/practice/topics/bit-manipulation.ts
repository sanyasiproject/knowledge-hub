import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Single Number",
      difficulty: "Easy",
      variation: "XOR cancellation",
      link: "https://leetcode.com/problems/single-number/",
      question: [
        "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one. You must implement a solution with linear runtime and constant extra space.",
        "Example 1:\nInput: nums = [4,1,2,1,2]\nOutput: 4",
        "Constraints:\n- 1 <= nums.length <= 3 * 10^4\n- -3 * 10^4 <= nums[i] <= 3 * 10^4\n- Each element appears twice except for one element which appears once",
      ],
      code: `int singleNumber(vector<int>& nums) {
    int res = 0;
    for (int x : nums) res ^= x;
    return res;
}`,
      explanation: [
        "XOR is commutative, associative, x ^ x = 0, and x ^ 0 = x, so XOR-ing the whole array cancels every paired value and leaves exactly the unpaired one.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Number of 1 Bits",
      difficulty: "Easy",
      variation: "Popcount / clear lowest set bit",
      link: "https://leetcode.com/problems/number-of-1-bits/",
      question: [
        "Given a 32-bit unsigned integer n, return the number of set bits (1 bits) in its binary representation (also known as the Hamming weight).",
        "Example 1:\nInput: n = 11 (binary 1011)\nOutput: 3",
        "Constraints:\n- The input is a 32-bit unsigned integer",
      ],
      code: `int hammingWeight(uint32_t n) {
    int count = 0;
    while (n != 0) {
        n &= (n - 1);  // clears the lowest set bit
        count++;
    }
    return count;
}`,
      explanation: [
        "n & (n - 1) removes exactly the lowest set bit of n (subtracting 1 flips that bit and everything below it, and the AND keeps only the untouched higher bits), so the loop runs once per set bit rather than 32 times.",
        "Time: O(k) where k is the number of set bits (at most 32). Space: O(1).",
      ],
    },
    {
      name: "Counting Bits",
      difficulty: "Easy",
      variation: "Popcount DP",
      link: "https://leetcode.com/problems/counting-bits/",
      question: [
        "Given an integer n, return an array ans of length n + 1 such that for each i (0 <= i <= n), ans[i] is the number of 1 bits in the binary representation of i.",
        "Example 1:\nInput: n = 5\nOutput: [0,1,1,2,1,2]",
        "Constraints:\n- 0 <= n <= 10^5",
      ],
      code: `vector<int> countBits(int n) {
    vector<int> dp(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        dp[i] = dp[i >> 1] + (i & 1);
    }
    return dp;
}`,
      explanation: [
        "The binary of i is the binary of i >> 1 with one extra low bit appended, so popcount(i) = popcount(i >> 1) plus that last bit (i & 1); since i >> 1 < i, results are always ready when needed.",
        "Time: O(n). Space: O(n) for the output.",
      ],
    },
    {
      name: "Reverse Bits",
      difficulty: "Easy",
      variation: "Bit-by-bit rebuild",
      link: "https://leetcode.com/problems/reverse-bits/",
      question: [
        "Reverse the bits of a given 32-bit unsigned integer.",
        "Example 1:\nInput: n = 43261596 (00000010100101000001111010011100)\nOutput: 964176192 (00111001011110000010100101000000)",
        "Constraints:\n- The input is a 32-bit unsigned integer",
      ],
      code: `uint32_t reverseBits(uint32_t n) {
    uint32_t res = 0;
    for (int i = 0; i < 32; i++) {
        res = (res << 1) | (n & 1);
        n >>= 1;
    }
    return res;
}`,
      explanation: [
        "Peel the lowest bit off n and push it onto the low end of the result 32 times; the first bit peeled ends up shifted left 31 times, exactly mirroring its position.",
        "Time: O(32) = O(1). Space: O(1).",
      ],
    },
    {
      name: "Power of Two",
      difficulty: "Easy",
      variation: "Single set bit test",
      link: "https://leetcode.com/problems/power-of-two/",
      question: [
        "Given an integer n, return true if it is a power of two. Otherwise, return false. An integer n is a power of two if there exists an integer x such that n == 2^x.",
        "Example 1:\nInput: n = 16\nOutput: true",
        "Example 2:\nInput: n = 3\nOutput: false",
        "Constraints:\n- -2^31 <= n <= 2^31 - 1",
      ],
      code: `bool isPowerOfTwo(int n) {
    return n > 0 && (n & (n - 1)) == 0;
}`,
      explanation: [
        "A positive power of two has exactly one set bit; n & (n - 1) clears the lowest set bit, so the result is zero exactly when there was only one bit. The n > 0 guard rejects zero and negatives.",
        "Related check for power of four: additionally require the single bit to sit at an even position, e.g. (n & 0x55555555) != 0.",
        "Time: O(1). Space: O(1).",
      ],
    },
    {
      name: "Missing Number",
      difficulty: "Easy",
      variation: "XOR over index and value",
      link: "https://leetcode.com/problems/missing-number/",
      question: [
        "Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.",
        "Example 1:\nInput: nums = [3,0,1]\nOutput: 2",
        "Constraints:\n- n == nums.length\n- 1 <= n <= 10^4\n- 0 <= nums[i] <= n\n- All the numbers of nums are unique",
      ],
      code: `int missingNumber(vector<int>& nums) {
    int n = nums.size();
    int res = n;  // start with the value that has no matching index
    for (int i = 0; i < n; i++) {
        res ^= i ^ nums[i];
    }
    return res;
}`,
      explanation: [
        "XOR every index 0..n-1, the extra value n, and every array element together: each present value pairs with its equal index (or with the seeded n) and cancels, leaving only the missing number.",
        "This avoids the potential overflow of the sum-formula approach while staying one pass and constant space.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Sum of Two Integers",
      difficulty: "Medium",
      variation: "Add without + (carry propagation)",
      link: "https://leetcode.com/problems/sum-of-two-integers/",
      question: [
        "Given two integers a and b, return the sum of the two integers without using the operators + and -.",
        "Example 1:\nInput: a = 1, b = 2\nOutput: 3",
        "Constraints:\n- -1000 <= a, b <= 1000",
      ],
      code: `int getSum(int a, int b) {
    unsigned ua = a, ub = b;
    while (ub != 0) {
        unsigned carry = (ua & ub) << 1;  // positions that generate a carry
        ua = ua ^ ub;                     // sum without carries
        ub = carry;
    }
    return (int)ua;
}`,
      explanation: [
        "XOR adds bits without carrying, while AND finds the positions that would carry; shifting the AND left by one moves each carry to the column it belongs in. Repeating until the carry is zero completes the addition.",
        "Unsigned arithmetic is used because left-shifting a negative signed value is undefined behavior in C++; two's complement makes the final cast correct for negative results.",
        "Time: O(32) iterations worst case. Space: O(1).",
      ],
    },
    {
      name: "Single Number III",
      difficulty: "Medium",
      variation: "XOR partition by lowest set bit",
      link: "https://leetcode.com/problems/single-number-iii/",
      question: [
        "Given an integer array nums, in which exactly two elements appear only once and all the other elements appear exactly twice, find the two elements that appear only once. You can return the answer in any order. Use linear time and constant extra space.",
        "Example 1:\nInput: nums = [1,2,1,3,2,5]\nOutput: [3,5]",
        "Constraints:\n- 2 <= nums.length <= 3 * 10^4\n- Each integer appears exactly twice except for two integers which appear once",
      ],
      code: `vector<int> singleNumber(vector<int>& nums) {
    unsigned all = 0;
    for (int v : nums) all ^= (unsigned)v;  // = x ^ y
    unsigned diff = all & (0u - all);       // lowest bit where x and y differ
    int a = 0, b = 0;
    for (int v : nums) {
        if ((unsigned)v & diff) a ^= v;
        else b ^= v;
    }
    return {a, b};
}`,
      explanation: [
        "XOR of everything gives x ^ y; any set bit of that value is a bit where x and y differ. Its lowest set bit (all & -all) splits the array into two groups, each containing exactly one of the singles plus complete pairs.",
        "XOR within each group then reduces to the classic Single Number problem twice. Unsigned arithmetic sidesteps signed-negation overflow on INT_MIN.",
        "Time: O(n) in two passes. Space: O(1).",
      ],
    },
    {
      name: "Single Number II",
      difficulty: "Medium",
      variation: "Modulo-3 bit counting",
      link: "https://leetcode.com/problems/single-number-ii/",
      question: [
        "Given an integer array nums where every element appears three times except for one, which appears exactly once, find the single element. You must implement a solution with linear runtime and constant extra space.",
        "Example 1:\nInput: nums = [2,2,3,2]\nOutput: 3",
        "Constraints:\n- 1 <= nums.length <= 3 * 10^4\n- -2^31 <= nums[i] <= 2^31 - 1\n- Each element appears exactly three times except for one element which appears once",
      ],
      code: `int singleNumber(vector<int>& nums) {
    int ones = 0, twos = 0;
    for (int x : nums) {
        ones = (ones ^ x) & ~twos;
        twos = (twos ^ x) & ~ones;
    }
    return ones;
}`,
      explanation: [
        "Per bit position, ones and twos together count occurrences modulo 3: a bit moves from ones to twos on its second appearance and is cleared from both on its third, so after the loop ones holds exactly the bits seen a non-multiple-of-3 number of times.",
        "Since every value except the answer appears three times, ones ends up equal to the single element, including for negatives (the trick is purely per-bit).",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Subsets",
      difficulty: "Medium",
      variation: "Bitmask enumeration",
      link: "https://leetcode.com/problems/subsets/",
      question: [
        "Given an integer array nums of unique elements, return all possible subsets (the power set) without duplicates, in any order. Solve it iteratively by treating each number from 0 to 2^n - 1 as a bitmask.",
        "Example 1:\nInput: nums = [1,2,3]\nOutput: [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]",
        "Constraints:\n- 1 <= nums.length <= 10\n- All the numbers of nums are unique",
      ],
      code: `vector<vector<int>> subsets(vector<int>& nums) {
    int n = nums.size();
    vector<vector<int>> out;
    out.reserve(1 << n);
    for (int mask = 0; mask < (1 << n); mask++) {
        vector<int> cur;
        for (int i = 0; i < n; i++) {
            if (mask & (1 << i)) cur.push_back(nums[i]);
        }
        out.push_back(cur);
    }
    return out;
}`,
      explanation: [
        "There is a bijection between subsets of an n-element set and n-bit integers: bit i of the mask says whether nums[i] is included. Iterating mask from 0 to 2^n - 1 therefore visits every subset exactly once with no recursion.",
        "This bitmask-enumeration pattern is the foundation for subset DP and for iterating submasks in harder problems.",
        "Time: O(n * 2^n). Space: O(1) beyond the output.",
      ],
    },
    {
      name: "Bitwise AND of Numbers Range",
      difficulty: "Medium",
      variation: "Common prefix of bits",
      link: "https://leetcode.com/problems/bitwise-and-of-numbers-range/",
      question: [
        "Given two integers left and right that represent the range [left, right], return the bitwise AND of all numbers in this range, inclusive.",
        "Example 1:\nInput: left = 5, right = 7\nOutput: 4",
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
        "Any bit position below the highest bit where left and right differ takes both values 0 and 1 somewhere in the range, so it ANDs to 0; only the common binary prefix of left and right survives.",
        "Right-shifting both until they are equal finds that common prefix, and shifting back restores its position.",
        "Time: O(32) = O(1). Space: O(1).",
      ],
    },
    {
      name: "Gray Code",
      difficulty: "Medium",
      variation: "Reflected code formula",
      link: "https://leetcode.com/problems/gray-code/",
      question: [
        "An n-bit gray code sequence is a sequence of 2^n integers where every integer is in [0, 2^n - 1], the first integer is 0, all integers are distinct, and adjacent integers (including the last and first) differ by exactly one bit. Given n, return any valid n-bit gray code sequence.",
        "Example 1:\nInput: n = 2\nOutput: [0,1,3,2]",
        "Constraints:\n- 1 <= n <= 16",
      ],
      code: `vector<int> grayCode(int n) {
    vector<int> res;
    res.reserve(1 << n);
    for (int i = 0; i < (1 << n); i++) {
        res.push_back(i ^ (i >> 1));
    }
    return res;
}`,
      explanation: [
        "The mapping g(i) = i ^ (i >> 1) is the standard binary-reflected Gray code: it is a bijection on [0, 2^n), and consecutive i values produce outputs differing in exactly one bit because incrementing i flips a suffix of bits whose XOR-with-shift collapses to a single changed bit.",
        "The sequence also wraps (last and first differ by one bit), satisfying the cyclic requirement.",
        "Time: O(2^n). Space: O(1) beyond the output.",
      ],
    },
    {
      name: "Minimum Flips to Make a OR b Equal to c",
      difficulty: "Medium",
      variation: "Per-bit case analysis",
      link: "https://leetcode.com/problems/minimum-flips-to-make-a-or-b-equal-to-c/",
      question: [
        "Given 3 positive numbers a, b and c, return the minimum number of bit flips required in some bits of a and b to make (a OR b) equal to c. A flip changes a single bit from 1 to 0 or from 0 to 1.",
        "Example 1:\nInput: a = 2, b = 6, c = 5\nOutput: 3\nExplanation: After flips a = 1, b = 4, c = 5 such that (a OR b) == c",
        "Constraints:\n- 1 <= a, b, c <= 10^9",
      ],
      code: `int minFlips(int a, int b, int c) {
    int flips = 0;
    for (int i = 0; i < 31; i++) {
        int ba = (a >> i) & 1, bb = (b >> i) & 1, bc = (c >> i) & 1;
        if (bc == 1) {
            if (ba == 0 && bb == 0) flips++;      // need at least one 1
        } else {
            flips += ba + bb;                     // every 1 must be cleared
        }
    }
    return flips;
}`,
      explanation: [
        "Bits are independent under OR, so solve each position separately: if c has a 1, one flip is needed only when both a and b have 0; if c has a 0, every 1 among a and b must be flipped off (0, 1, or 2 flips).",
        "Summing the per-bit minima gives the global minimum because no flip affects more than one position.",
        "Time: O(31) = O(1). Space: O(1).",
      ],
    },
    {
      name: "Total Hamming Distance",
      difficulty: "Medium",
      variation: "Column-wise pair counting",
      link: "https://leetcode.com/problems/total-hamming-distance/",
      question: [
        "The Hamming distance between two integers is the number of positions at which the corresponding bits are different. Given an integer array nums, return the sum of Hamming distances between all pairs of the integers in nums.",
        "Example 1:\nInput: nums = [4,14,2]\nOutput: 6",
        "Constraints:\n- 1 <= nums.length <= 10^4\n- 0 <= nums[i] <= 10^9",
      ],
      code: `int totalHammingDistance(vector<int>& nums) {
    int n = nums.size();
    int total = 0;
    for (int bit = 0; bit < 31; bit++) {
        int ones = 0;
        for (int x : nums) ones += (x >> bit) & 1;
        total += ones * (n - ones);
    }
    return total;
}`,
      explanation: [
        "Instead of comparing all O(n^2) pairs, count per bit position: if k numbers have a 1 there and n - k have a 0, that position contributes exactly k * (n - k) to the total, since only mixed pairs differ.",
        "Summing over all 31 relevant positions counts every differing pair-position exactly once.",
        "Time: O(31 * n). Space: O(1).",
      ],
    },
    {
      name: "XOR Queries of a Subarray",
      difficulty: "Medium",
      variation: "Prefix XOR",
      link: "https://leetcode.com/problems/xor-queries-of-a-subarray/",
      question: [
        "You are given an array arr of positive integers and an array queries where queries[i] = [left_i, right_i]. For each query compute the XOR of elements from index left_i to right_i inclusive. Return an array answer where answer[i] is the answer to the i-th query.",
        "Example 1:\nInput: arr = [1,3,4,8], queries = [[0,1],[1,2],[0,3],[3,3]]\nOutput: [2,7,14,8]",
        "Constraints:\n- 1 <= arr.length, queries.length <= 3 * 10^4\n- 1 <= arr[i] <= 10^9\n- 0 <= left_i <= right_i < arr.length",
      ],
      code: `vector<int> xorQueries(vector<int>& arr, vector<vector<int>>& queries) {
    int n = arr.size();
    vector<int> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] ^ arr[i];
    vector<int> ans;
    ans.reserve(queries.size());
    for (auto& q : queries) {
        ans.push_back(pre[q[1] + 1] ^ pre[q[0]]);
    }
    return ans;
}`,
      explanation: [
        "Because XOR is its own inverse, a prefix-XOR array works exactly like prefix sums: XOR of arr[l..r] equals pre[r+1] ^ pre[l], since the shared prefix arr[0..l-1] cancels itself.",
        "One O(n) preprocessing pass turns every query into O(1).",
        "Time: O(n + q). Space: O(n) for the prefix array.",
      ],
    },
    {
      name: "Maximum XOR of Two Numbers in an Array",
      difficulty: "Medium",
      variation: "Greedy bit-by-bit with prefix set",
      link: "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/",
      question: [
        "Given an integer array nums, return the maximum result of nums[i] XOR nums[j], where 0 <= i <= j < n.",
        "Example 1:\nInput: nums = [3,10,5,25,2,8]\nOutput: 28\nExplanation: The maximum result is 5 XOR 25 = 28",
        "Constraints:\n- 1 <= nums.length <= 2 * 10^5\n- 0 <= nums[i] <= 2^31 - 1",
      ],
      code: `int findMaximumXOR(vector<int>& nums) {
    int mask = 0, best = 0;
    for (int bit = 30; bit >= 0; bit--) {
        mask |= (1 << bit);
        unordered_set<int> prefixes;
        for (int x : nums) prefixes.insert(x & mask);
        int cand = best | (1 << bit);  // try to also win this bit
        for (int p : prefixes) {
            if (prefixes.count(cand ^ p)) { best = cand; break; }
        }
    }
    return best;
}`,
      explanation: [
        "Build the answer greedily from the highest bit down: assume the answer can also have the current bit set (cand), then check feasibility using the identity a ^ b = cand implies b = cand ^ a over the numbers truncated to the bits decided so far.",
        "A hash set of truncated prefixes makes that check O(n) per bit; higher bits dominate lower ones, so the greedy choice is always safe. A binary trie achieves the same bound.",
        "Time: O(31 * n). Space: O(n) for the prefix set.",
      ],
    },
    {
      name: "UTF-8 Validation",
      difficulty: "Medium",
      variation: "Bit-pattern header decoding",
      link: "https://leetcode.com/problems/utf-8-validation/",
      question: [
        "Given an integer array data representing bytes (only the least significant 8 bits of each integer are used), return whether it represents a valid UTF-8 encoding. A character is 1 to 4 bytes: a 1-byte character starts with 0; an n-byte character starts with n ones then a zero, followed by n-1 continuation bytes each starting with 10.",
        "Example 1:\nInput: data = [197,130,1]\nOutput: true\nExplanation: 197 = 11000101 starts a 2-byte character, 130 = 10000010 continues it, 1 = 00000001 is a 1-byte character",
        "Constraints:\n- 1 <= data.length <= 2 * 10^4\n- 0 <= data[i] <= 255",
      ],
      code: `bool validUtf8(vector<int>& data) {
    int i = 0, n = data.size();
    while (i < n) {
        int b = data[i] & 0xFF;
        int len;
        if ((b >> 7) == 0) len = 1;
        else if ((b >> 5) == 0b110) len = 2;
        else if ((b >> 4) == 0b1110) len = 3;
        else if ((b >> 3) == 0b11110) len = 4;
        else return false;  // 10xxxxxx here, or more than 4 leading ones
        if (i + len > n) return false;
        for (int j = 1; j < len; j++) {
            if (((data[i + j] & 0xFF) >> 6) != 0b10) return false;
        }
        i += len;
    }
    return true;
}`,
      explanation: [
        "Right-shifting the leading byte exposes its header pattern directly: 0xxxxxxx, 110xxxxx, 1110xxxx, or 11110xxx determine the sequence length, and anything else (including a stray continuation byte) is invalid.",
        "Each continuation byte must match 10xxxxxx, checked by shifting away its low 6 bits; the cursor then jumps a whole character at a time.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Divide Two Integers",
      difficulty: "Medium",
      variation: "Shift-and-subtract division",
      link: "https://leetcode.com/problems/divide-two-integers/",
      question: [
        "Given two integers dividend and divisor, divide them without using multiplication, division, and mod operators. Truncate the result toward zero. If the quotient overflows the signed 32-bit range, return 2^31 - 1.",
        "Example 1:\nInput: dividend = 10, divisor = 3\nOutput: 3",
        "Example 2:\nInput: dividend = 7, divisor = -3\nOutput: -2",
        "Constraints:\n- -2^31 <= dividend, divisor <= 2^31 - 1\n- divisor != 0",
      ],
      code: `int divide(int dividend, int divisor) {
    if (dividend == INT_MIN && divisor == -1) return INT_MAX;  // overflow case
    long long a = dividend, b = divisor;
    bool neg = (a < 0) ^ (b < 0);
    if (a < 0) a = -a;
    if (b < 0) b = -b;
    long long q = 0;
    while (a >= b) {
        long long chunk = b, mult = 1;
        while (a >= (chunk << 1)) {
            chunk <<= 1;
            mult <<= 1;
        }
        a -= chunk;
        q += mult;
    }
    return (int)(neg ? -q : q);
}`,
      explanation: [
        "Repeatedly subtract the largest divisor * 2^k that still fits in the remaining dividend; doubling by left shift finds that chunk in O(log) steps, mimicking binary long division.",
        "Each outer iteration at least halves the remainder relative to the chunk found, so the whole loop is O(log^2) shifts. The single overflow case INT_MIN / -1 is handled up front, and 64-bit magnitudes avoid negation overflow.",
        "Time: O(log^2 n) bit operations. Space: O(1).",
      ],
    },
  ],
};
