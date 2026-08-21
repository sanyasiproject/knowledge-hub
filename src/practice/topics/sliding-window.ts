import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Maximum Average Subarray I",
      difficulty: "Easy",
      variation: "Fixed window",
      link: "https://leetcode.com/problems/maximum-average-subarray-i/",
      question: [
        "You are given an integer array nums of n elements and an integer k. Find a contiguous subarray of length exactly k that has the maximum average value, and return this value. Answers within 10^-5 of the actual answer are accepted.",
        "Example 1:\nInput: nums = [1,12,-5,-6,50,3], k = 4\nOutput: 12.75000\nExplanation: (12 - 5 - 6 + 50) / 4 = 12.75.",
        "Constraints:\n- n == nums.length\n- 1 <= k <= n <= 10^5\n- -10^4 <= nums[i] <= 10^4",
      ],
      code: `double findMaxAverage(vector<int>& nums, int k) {
    long long sum = 0;
    for (int i = 0; i < k; i++) sum += nums[i];
    long long best = sum;
    for (int i = k; i < (int)nums.size(); i++) {
        sum += nums[i] - nums[i - k];
        best = max(best, sum);
    }
    return (double)best / k;
}`,
      explanation: [
        "Build the sum of the first k elements once, then slide the window one step at a time: add the entering element and subtract the leaving one. Each of the n - k slides costs O(1) instead of recomputing a k-element sum.",
        "Maximizing the average over fixed-length windows is the same as maximizing the sum, so only the sum is tracked and the division happens once at the end.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Max Sum Subarray of Size K",
      difficulty: "Easy",
      variation: "Fixed window",
      link: "https://www.geeksforgeeks.org/find-maximum-minimum-sum-subarray-size-k/",
      question: [
        "Given an array of integers arr and a number k, return the maximum sum of any contiguous subarray of size k.",
        "Example 1:\nInput: arr = [100, 200, 300, 400], k = 2\nOutput: 700\nExplanation: 300 + 400 = 700 is the largest sum of two adjacent elements.",
        "Example 2:\nInput: arr = [2, 3], k = 3\nOutput: -1 (no window of size k exists)",
        "Constraints:\n- 1 <= arr.length <= 10^5\n- 1 <= k <= 10^5\n- -10^4 <= arr[i] <= 10^4",
      ],
      code: `long long maximumSumSubarray(vector<int>& arr, int k) {
    int n = arr.size();
    if (k > n) return -1;
    long long sum = 0;
    for (int i = 0; i < k; i++) sum += arr[i];
    long long best = sum;
    for (int i = k; i < n; i++) {
        sum += arr[i] - arr[i - k];
        best = max(best, sum);
    }
    return best;
}`,
      explanation: [
        "This is the canonical fixed-window template: one pass to seed the first window, then a rolling update where each step adds the new right element and removes the old left element.",
        "The window sum stays exact at every step because exactly one element enters and one leaves, so the maximum over all positions is found in a single pass.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      variation: "Variable window, shrink on violation",
      link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
      question: [
        "Given a string s, find the length of the longest substring without duplicate characters.",
        "Example 1:\nInput: s = \"abcabcbb\"\nOutput: 3\nExplanation: The answer is \"abc\", with length 3.",
        "Example 2:\nInput: s = \"pwwkew\"\nOutput: 3\nExplanation: The answer is \"wke\"; \"pwke\" is a subsequence, not a substring.",
        "Constraints:\n- 0 <= s.length <= 5 * 10^4\n- s consists of English letters, digits, symbols and spaces",
      ],
      code: `int lengthOfLongestSubstring(string s) {
    int count[256] = {0};
    int best = 0, l = 0;
    for (int r = 0; r < (int)s.size(); r++) {
        count[(unsigned char)s[r]]++;
        while (count[(unsigned char)s[r]] > 1) {
            count[(unsigned char)s[l]]--;
            l++;
        }
        best = max(best, r - l + 1);
    }
    return best;
}`,
      explanation: [
        "Grow the window by moving r; when the newest character becomes a duplicate, shrink from the left until that character's count drops back to one. The window between l and r is always duplicate-free after the inner loop.",
        "Shrinking is safe because any valid window containing the duplicate pair would still contain both copies - discarding prefixes up to the first copy loses no candidate answers.",
        "Each index enters and leaves the window at most once. Time: O(n). Space: O(1) - fixed-size character table.",
      ],
    },
    {
      name: "Minimum Size Subarray Sum",
      difficulty: "Medium",
      variation: "Variable window, shrink while valid",
      link: "https://leetcode.com/problems/minimum-size-subarray-sum/",
      question: [
        "Given an array of positive integers nums and a positive integer target, return the minimal length of a contiguous subarray whose sum is greater than or equal to target. If there is no such subarray, return 0.",
        "Example 1:\nInput: target = 7, nums = [2,3,1,2,4,3]\nOutput: 2\nExplanation: The subarray [4,3] has the minimal length.",
        "Constraints:\n- 1 <= target <= 10^9\n- 1 <= nums.length <= 10^5\n- 1 <= nums[i] <= 10^4",
      ],
      code: `int minSubArrayLen(int target, vector<int>& nums) {
    int n = nums.size();
    int best = n + 1;
    long long sum = 0;
    int l = 0;
    for (int r = 0; r < n; r++) {
        sum += nums[r];
        while (sum >= target) {
            best = min(best, r - l + 1);
            sum -= nums[l];
            l++;
        }
    }
    return best == n + 1 ? 0 : best;
}`,
      explanation: [
        "Because all numbers are positive, the window sum grows monotonically as r advances and shrinks monotonically as l advances. Once the sum reaches target, shrink from the left as far as possible - every shrink step records a shorter valid window.",
        "Monotonicity is what makes the two-pointer sweep exhaustive: l never needs to move backward, so all optimal windows are visited.",
        "Time: O(n) - each pointer moves at most n times. Space: O(1).",
      ],
    },
    {
      name: "Max Consecutive Ones III",
      difficulty: "Medium",
      variation: "Variable window, budget of K flips",
      link: "https://leetcode.com/problems/max-consecutive-ones-iii/",
      question: [
        "Given a binary array nums and an integer k, return the maximum number of consecutive 1s in the array if you can flip at most k 0s.",
        "Example 1:\nInput: nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2\nOutput: 6\nExplanation: Flip the two 0s at indices 4 and 5 (or 3 and 4) to get six consecutive 1s.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- nums[i] is 0 or 1\n- 0 <= k <= nums.length",
      ],
      code: `int longestOnes(vector<int>& nums, int k) {
    int l = 0, zeros = 0, best = 0;
    for (int r = 0; r < (int)nums.size(); r++) {
        if (nums[r] == 0) zeros++;
        while (zeros > k) {
            if (nums[l] == 0) zeros--;
            l++;
        }
        best = max(best, r - l + 1);
    }
    return best;
}`,
      explanation: [
        "Reframe the problem: find the longest window containing at most k zeros - the zeros inside are exactly the flips used. Expand right and count zeros; when the count exceeds k, advance the left edge until it is back within budget.",
        "The window is valid after every iteration, so the maximum window length seen is the answer.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Fruit Into Baskets",
      difficulty: "Medium",
      variation: "Longest window with at most 2 distinct",
      link: "https://leetcode.com/problems/fruit-into-baskets/",
      question: [
        "You are visiting a row of trees where fruits[i] is the type of fruit the i-th tree produces. You have two baskets, each holding only one type of fruit with no limit on amount. Starting from any tree, you must pick exactly one fruit from every tree while moving right, stopping when a tree's fruit fits in neither basket. Return the maximum number of fruits you can pick.",
        "Example 1:\nInput: fruits = [1,2,1]\nOutput: 3",
        "Example 2:\nInput: fruits = [1,2,3,2,2]\nOutput: 4\nExplanation: Pick from trees [2,3,2,2].",
        "Constraints:\n- 1 <= fruits.length <= 10^5\n- 0 <= fruits[i] < fruits.length",
      ],
      code: `int totalFruit(vector<int>& fruits) {
    unordered_map<int, int> count;
    int l = 0, best = 0;
    for (int r = 0; r < (int)fruits.size(); r++) {
        count[fruits[r]]++;
        while ((int)count.size() > 2) {
            if (--count[fruits[l]] == 0) count.erase(fruits[l]);
            l++;
        }
        best = max(best, r - l + 1);
    }
    return best;
}`,
      explanation: [
        "The story translates to: longest subarray with at most 2 distinct values. Track per-type counts in a hash map; when a third type appears, shrink from the left, erasing a type once its count hits zero.",
        "Replacing 2 with K gives the general Longest Substring with At Most K Distinct Characters solution unchanged.",
        "Time: O(n). Space: O(1) - the map never holds more than 3 keys.",
      ],
    },
    {
      name: "Longest Repeating Character Replacement",
      difficulty: "Medium",
      variation: "Variable window, max-frequency trick",
      link: "https://leetcode.com/problems/longest-repeating-character-replacement/",
      question: [
        "You are given a string s of uppercase English letters and an integer k. You can choose any character of the string and change it to any other uppercase letter, at most k times. Return the length of the longest substring containing the same letter you can get after performing the operations.",
        "Example 1:\nInput: s = \"ABAB\", k = 2\nOutput: 4\nExplanation: Replace the two 'A's with 'B's (or vice versa).",
        "Example 2:\nInput: s = \"AABABBA\", k = 1\nOutput: 4",
        "Constraints:\n- 1 <= s.length <= 10^5\n- s consists of only uppercase English letters\n- 0 <= k <= s.length",
      ],
      code: `int characterReplacement(string s, int k) {
    int count[26] = {0};
    int l = 0, maxFreq = 0, best = 0;
    for (int r = 0; r < (int)s.size(); r++) {
        maxFreq = max(maxFreq, ++count[s[r] - 'A']);
        if (r - l + 1 - maxFreq > k) {
            count[s[l] - 'A']--;
            l++;
        }
        best = max(best, r - l + 1);
    }
    return best;
}`,
      explanation: [
        "A window is fixable when its length minus the count of its most frequent letter is at most k - those are the characters that must be replaced. Expand right; if the window becomes unfixable, slide the left edge by one so the window size never shrinks.",
        "maxFreq is deliberately never decreased: it may be stale, but the recorded best only needs windows at least as good as the current record, and a new record forces a genuinely higher maxFreq. This keeps the update O(1).",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Permutation in String",
      difficulty: "Medium",
      variation: "Fixed window, frequency match",
      link: "https://leetcode.com/problems/permutation-in-string/",
      question: [
        "Given two strings s1 and s2, return true if s2 contains a permutation of s1 as a substring, or false otherwise.",
        "Example 1:\nInput: s1 = \"ab\", s2 = \"eidbaooo\"\nOutput: true\nExplanation: s2 contains \"ba\", a permutation of s1.",
        "Example 2:\nInput: s1 = \"ab\", s2 = \"eidboaoo\"\nOutput: false",
        "Constraints:\n- 1 <= s1.length, s2.length <= 10^4\n- s1 and s2 consist of lowercase English letters",
      ],
      code: `bool checkInclusion(string s1, string s2) {
    int m = s1.size(), n = s2.size();
    if (m > n) return false;
    int need[26] = {0}, have[26] = {0};
    for (char c : s1) need[c - 'a']++;
    int matches = 0;
    for (int i = 0; i < 26; i++) {
        if (need[i] == 0) matches++;
    }
    for (int r = 0; r < n; r++) {
        int in = s2[r] - 'a';
        if (++have[in] == need[in]) matches++;
        else if (have[in] == need[in] + 1) matches--;
        if (r >= m) {
            int out = s2[r - m] - 'a';
            if (have[out] == need[out]) matches--;
            --have[out];
            if (have[out] == need[out]) matches++;
        }
        if (r >= m - 1 && matches == 26) return true;
    }
    return false;
}`,
      explanation: [
        "A permutation of s1 is any window of length |s1| whose letter counts equal s1's counts. Slide a fixed window over s2 and keep a matches counter of how many of the 26 letters currently agree between the window and the target.",
        "Each slide changes only two letters (one enters, one leaves), so matches is updated in O(1) - when all 26 agree, the window is a permutation.",
        "Time: O(|s1| + |s2|). Space: O(1).",
      ],
    },
    {
      name: "Find All Anagrams in a String",
      difficulty: "Medium",
      variation: "Fixed window, frequency match",
      link: "https://leetcode.com/problems/find-all-anagrams-in-a-string/",
      question: [
        "Given two strings s and p, return an array of all the start indices of p's anagrams in s. You may return the answer in any order.",
        "Example 1:\nInput: s = \"cbaebabacd\", p = \"abc\"\nOutput: [0,6]\nExplanation: Substrings \"cba\" (index 0) and \"bac\" (index 6) are anagrams of \"abc\".",
        "Constraints:\n- 1 <= s.length, p.length <= 3 * 10^4\n- s and p consist of lowercase English letters",
      ],
      code: `vector<int> findAnagrams(string s, string p) {
    int n = s.size(), m = p.size();
    vector<int> res;
    if (m > n) return res;
    int need[26] = {0}, have[26] = {0};
    for (char c : p) need[c - 'a']++;
    for (int r = 0; r < n; r++) {
        have[s[r] - 'a']++;
        if (r >= m) have[s[r - m] - 'a']--;
        if (r >= m - 1) {
            bool ok = true;
            for (int i = 0; i < 26; i++) {
                if (have[i] != need[i]) { ok = false; break; }
            }
            if (ok) res.push_back(r - m + 1);
        }
    }
    return res;
}`,
      explanation: [
        "Identical structure to Permutation in String, but every matching window's start index is collected instead of returning on the first hit.",
        "Maintaining the window count array incrementally means each position costs a constant 26-entry comparison, avoiding re-counting the window from scratch.",
        "Time: O(26 * n). Space: O(1).",
      ],
    },
    {
      name: "Grumpy Bookstore Owner",
      difficulty: "Medium",
      variation: "Fixed window over recoverable loss",
      link: "https://leetcode.com/problems/grumpy-bookstore-owner/",
      question: [
        "A bookstore owner is grumpy during some minutes; customers[i] enter at minute i and are satisfied unless grumpy[i] == 1. The owner can use a secret technique to stay not grumpy for one stretch of exactly minutes consecutive minutes, once. Return the maximum number of customers that can be satisfied throughout the day.",
        "Example 1:\nInput: customers = [1,0,1,2,1,1,7,5], grumpy = [0,1,0,1,0,1,0,1], minutes = 3\nOutput: 16\nExplanation: Use the technique for the last 3 minutes: 1 + 1 + 1 + 1 + 7 + 5 = 16.",
        "Constraints:\n- n == customers.length == grumpy.length\n- 1 <= minutes <= n <= 2 * 10^4\n- 0 <= customers[i] <= 1000\n- grumpy[i] is 0 or 1",
      ],
      code: `int maxSatisfied(vector<int>& customers, vector<int>& grumpy, int minutes) {
    int n = customers.size();
    int base = 0;
    for (int i = 0; i < n; i++) {
        if (grumpy[i] == 0) base += customers[i];
    }
    int gain = 0, bestGain = 0;
    for (int i = 0; i < n; i++) {
        if (grumpy[i] == 1) gain += customers[i];
        if (i >= minutes && grumpy[i - minutes] == 1) gain -= customers[i - minutes];
        bestGain = max(bestGain, gain);
    }
    return base + bestGain;
}`,
      explanation: [
        "Customers during non-grumpy minutes are satisfied no matter what, so sum them as a fixed base. The technique only recovers customers in grumpy minutes inside its window, so slide a fixed window over the grumpy-only customer counts and take the best recoverable gain.",
        "Splitting the answer into base plus best window gain turns a placement problem into a plain fixed-window maximum.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Get Equal Substrings Within Budget",
      difficulty: "Medium",
      variation: "Variable window, cost budget",
      link: "https://leetcode.com/problems/get-equal-substrings-within-budget/",
      question: [
        "You are given two strings s and t of the same length and an integer maxCost. Changing s[i] to t[i] costs |s[i] - t[i]| (absolute difference of ASCII values). Return the maximum length of a substring of s that can be changed to the corresponding substring of t with total cost at most maxCost.",
        "Example 1:\nInput: s = \"abcd\", t = \"bcdf\", maxCost = 3\nOutput: 3\nExplanation: \"abc\" can be changed to \"bcd\" for a cost of 3.",
        "Constraints:\n- 1 <= s.length == t.length <= 10^5\n- 0 <= maxCost <= 10^6\n- s and t consist of only lowercase English letters",
      ],
      code: `int equalSubstring(string s, string t, int maxCost) {
    int l = 0, best = 0;
    long long cost = 0;
    for (int r = 0; r < (int)s.size(); r++) {
        cost += abs(s[r] - t[r]);
        while (cost > maxCost) {
            cost -= abs(s[l] - t[l]);
            l++;
        }
        best = max(best, r - l + 1);
    }
    return best;
}`,
      explanation: [
        "Convert the pair of strings into a per-index cost array; the task becomes the longest window whose cost sum stays within maxCost - the same shape as Max Consecutive Ones III with a numeric budget instead of a zero count.",
        "Costs are non-negative, so the window sum is monotone under expansion and shrinking, which is exactly the property the two-pointer sweep needs.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Maximum Points You Can Obtain from Cards",
      difficulty: "Medium",
      variation: "Inverse window",
      link: "https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/",
      question: [
        "There are several cards arranged in a row, with cardPoints[i] points on the i-th card. In one step you take one card from the beginning or the end of the row, and you must take exactly k cards. Return the maximum score you can obtain.",
        "Example 1:\nInput: cardPoints = [1,2,3,4,5,6,1], k = 3\nOutput: 12\nExplanation: Take the three rightmost cards: 6 + 5 + 1 = 12.",
        "Constraints:\n- 1 <= cardPoints.length <= 10^5\n- 1 <= cardPoints[i] <= 10^4\n- 1 <= k <= cardPoints.length",
      ],
      code: `int maxScore(vector<int>& cardPoints, int k) {
    int n = cardPoints.size();
    long long total = 0;
    for (int x : cardPoints) total += x;
    if (k == n) return (int)total;
    int keep = n - k;
    long long sum = 0;
    for (int i = 0; i < keep; i++) sum += cardPoints[i];
    long long minKeep = sum;
    for (int i = keep; i < n; i++) {
        sum += cardPoints[i] - cardPoints[i - keep];
        minKeep = min(minKeep, sum);
    }
    return (int)(total - minKeep);
}`,
      explanation: [
        "Taking k cards from the two ends is the same as leaving a contiguous block of n - k cards in the middle. Maximizing the taken points therefore means minimizing the sum of the kept block.",
        "That inversion converts an awkward take-from-either-end choice into a standard fixed-window minimum-sum sweep.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Binary Subarrays With Sum",
      difficulty: "Medium",
      variation: "At-most-K trick, counting",
      link: "https://leetcode.com/problems/binary-subarrays-with-sum/",
      question: [
        "Given a binary array nums and an integer goal, return the number of non-empty subarrays with a sum equal to goal.",
        "Example 1:\nInput: nums = [1,0,1,0,1], goal = 2\nOutput: 4\nExplanation: The four subarrays are [1,0,1], [1,0,1,0], [0,1,0,1], [1,0,1].",
        "Constraints:\n- 1 <= nums.length <= 3 * 10^4\n- nums[i] is 0 or 1\n- 0 <= goal <= nums.length",
      ],
      code: `int numSubarraysWithSum(vector<int>& nums, int goal) {
    auto atMost = [&](int k) -> long long {
        if (k < 0) return 0;
        long long count = 0;
        int l = 0, sum = 0;
        for (int r = 0; r < (int)nums.size(); r++) {
            sum += nums[r];
            while (sum > k) {
                sum -= nums[l];
                l++;
            }
            count += r - l + 1;
        }
        return count;
    };
    return (int)(atMost(goal) - atMost(goal - 1));
}`,
      explanation: [
        "Windows with sum exactly goal are not monotone, so count them as atMost(goal) - atMost(goal - 1). Each atMost call is a standard shrink-while-over-budget window.",
        "Inside atMost, when the window [l, r] is valid, every subarray ending at r with a start in [l, r] is also valid, contributing r - l + 1 - which is why adding the window length counts all of them exactly once.",
        "Time: O(n) - two linear passes. Space: O(1).",
      ],
    },
    {
      name: "Count Number of Nice Subarrays",
      difficulty: "Medium",
      variation: "At-most-K trick, counting",
      link: "https://leetcode.com/problems/count-number-of-nice-subarrays/",
      question: [
        "Given an array of integers nums and an integer k, a continuous subarray is called nice if there are exactly k odd numbers in it. Return the number of nice subarrays.",
        "Example 1:\nInput: nums = [1,1,2,1,1], k = 3\nOutput: 2\nExplanation: The nice subarrays are [1,1,2,1] and [1,2,1,1].",
        "Example 2:\nInput: nums = [2,2,2,1,2,2,1,2,2,2], k = 2\nOutput: 16",
        "Constraints:\n- 1 <= nums.length <= 5 * 10^4\n- 1 <= nums[i] <= 10^5\n- 1 <= k <= nums.length",
      ],
      code: `int numberOfSubarrays(vector<int>& nums, int k) {
    auto atMost = [&](int m) -> long long {
        if (m < 0) return 0;
        long long count = 0;
        int l = 0, odd = 0;
        for (int r = 0; r < (int)nums.size(); r++) {
            odd += nums[r] % 2;
            while (odd > m) {
                odd -= nums[l] % 2;
                l++;
            }
            count += r - l + 1;
        }
        return count;
    };
    return (int)(atMost(k) - atMost(k - 1));
}`,
      explanation: [
        "Mapping each number to its parity turns the problem into counting subarrays with exactly k ones - identical in shape to Binary Subarrays With Sum, solved with the same exactly = atMost(k) - atMost(k-1) identity.",
        "The at-most counter works because the number of odd elements in a window only grows as r advances and only shrinks as l advances, keeping the two-pointer sweep valid.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Subarrays with K Different Integers",
      difficulty: "Hard",
      variation: "At-most-K trick, distinct counts",
      link: "https://leetcode.com/problems/subarrays-with-k-different-integers/",
      question: [
        "Given an integer array nums and an integer k, return the number of good subarrays of nums, where a good subarray is a contiguous subarray with exactly k different integers.",
        "Example 1:\nInput: nums = [1,2,1,2,3], k = 2\nOutput: 7\nExplanation: [1,2], [2,1], [1,2], [2,3], [1,2,1], [2,1,2], [1,2,1,2].",
        "Example 2:\nInput: nums = [1,2,1,3,4], k = 3\nOutput: 3",
        "Constraints:\n- 1 <= nums.length <= 2 * 10^4\n- 1 <= nums[i], k <= nums.length",
      ],
      code: `int subarraysWithKDistinct(vector<int>& nums, int k) {
    auto atMost = [&](int m) -> long long {
        if (m <= 0) return 0;
        vector<int> count(nums.size() + 1, 0);
        long long total = 0;
        int l = 0, distinct = 0;
        for (int r = 0; r < (int)nums.size(); r++) {
            if (count[nums[r]]++ == 0) distinct++;
            while (distinct > m) {
                if (--count[nums[l]] == 0) distinct--;
                l++;
            }
            total += r - l + 1;
        }
        return total;
    };
    return (int)(atMost(k) - atMost(k - 1));
}`,
      explanation: [
        "Exactly-k-distinct windows are not monotone (both growing and shrinking can fix a violation), so count subarrays with at most k distinct and subtract those with at most k - 1.",
        "Each atMost pass is a plain variable window over value counts: expand right, and while too many distinct values are present, shrink from the left. Valid windows ending at r contribute r - l + 1 subarrays.",
        "Time: O(n) - two linear passes. Space: O(n) for the count array.",
      ],
    },
    {
      name: "Sliding Window Maximum",
      difficulty: "Hard",
      variation: "Fixed window, monotonic deque",
      link: "https://leetcode.com/problems/sliding-window-maximum/",
      question: [
        "You are given an array of integers nums and a sliding window of size k moving from the very left to the very right, one position at a time. You can only see the k numbers in the window. Return an array of the maximum of each window.",
        "Example 1:\nInput: nums = [1,3,-1,-3,5,3,6,7], k = 3\nOutput: [3,3,5,5,6,7]",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4\n- 1 <= k <= nums.length",
      ],
      code: `vector<int> maxSlidingWindow(vector<int>& nums, int k) {
    deque<int> dq;
    vector<int> res;
    for (int i = 0; i < (int)nums.size(); i++) {
        if (!dq.empty() && dq.front() <= i - k) dq.pop_front();
        while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();
        dq.push_back(i);
        if (i >= k - 1) res.push_back(nums[dq.front()]);
    }
    return res;
}`,
      explanation: [
        "Keep a deque of indices whose values are strictly decreasing. Before inserting a new element, pop everything smaller from the back - those elements are both older and smaller, so they can never be a future window maximum.",
        "The front of the deque is always the current window's maximum; it is evicted only when its index slides out of range. Each index is pushed and popped at most once.",
        "Time: O(n) amortized. Space: O(k).",
      ],
    },
    {
      name: "Minimum Window Substring",
      difficulty: "Hard",
      variation: "Variable window, need/have counters",
      link: "https://leetcode.com/problems/minimum-window-substring/",
      question: [
        "Given two strings s and t, return the minimum window substring of s that contains every character of t (including duplicates). If there is no such substring, return the empty string. The answer is guaranteed unique.",
        "Example 1:\nInput: s = \"ADOBECODEBANC\", t = \"ABC\"\nOutput: \"BANC\"",
        "Example 2:\nInput: s = \"a\", t = \"aa\"\nOutput: \"\"\nExplanation: Both 'a's of t must be in the window.",
        "Constraints:\n- 1 <= s.length, t.length <= 10^5\n- s and t consist of uppercase and lowercase English letters",
      ],
      code: `string minWindow(string s, string t) {
    if (t.size() > s.size()) return "";
    int need[128] = {0};
    for (char c : t) need[(unsigned char)c]++;
    int required = t.size();
    int bestLen = INT_MAX, bestStart = 0;
    int l = 0;
    for (int r = 0; r < (int)s.size(); r++) {
        if (need[(unsigned char)s[r]] > 0) required--;
        need[(unsigned char)s[r]]--;
        while (required == 0) {
            if (r - l + 1 < bestLen) {
                bestLen = r - l + 1;
                bestStart = l;
            }
            need[(unsigned char)s[l]]++;
            if (need[(unsigned char)s[l]] > 0) required++;
            l++;
        }
    }
    return bestLen == INT_MAX ? "" : s.substr(bestStart, bestLen);
}`,
      explanation: [
        "The need table tracks how many of each character are still missing; required counts total missing characters. Expanding right decrements them, and required hitting zero means the window covers all of t.",
        "While the window is valid, shrinking from the left tightens it: each valid position of l is checked against the best, and l stops the moment removing a character would make the window invalid again. Entries in need go negative for surplus characters, which is what makes the greater-than-zero checks pick out genuinely needed ones.",
        "Time: O(|s| + |t|) - each pointer moves forward only. Space: O(1) - fixed 128-entry table.",
      ],
    },
  ],
};
