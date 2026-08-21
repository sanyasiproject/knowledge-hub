import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Valid Palindrome",
      difficulty: "Easy",
      variation: "Opposite-end pointers",
      link: "https://leetcode.com/problems/valid-palindrome/",
      question: [
        "Given a string s, return true if it is a palindrome after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, otherwise return false.",
        "Example 1:\nInput: s = \"A man, a plan, a canal: Panama\"\nOutput: true\nExplanation: \"amanaplanacanalpanama\" is a palindrome.",
        "Example 2:\nInput: s = \"race a car\"\nOutput: false",
        "Constraints:\n- 1 <= s.length <= 2 * 10^5\n- s consists only of printable ASCII characters",
      ],
      code: `bool isPalindrome(string s) {
    int l = 0, r = (int)s.size() - 1;
    while (l < r) {
        while (l < r && !isalnum((unsigned char)s[l])) l++;
        while (l < r && !isalnum((unsigned char)s[r])) r--;
        if (tolower((unsigned char)s[l]) != tolower((unsigned char)s[r])) return false;
        l++;
        r--;
    }
    return true;
}`,
      explanation: [
        "Walk one pointer from each end, skipping characters that are not letters or digits. Compare the lowercase forms; any mismatch proves the cleaned string is not a palindrome.",
        "Each pointer only moves inward, so every character is examined at most once and no extra cleaned copy of the string is needed.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Is Subsequence",
      difficulty: "Easy",
      variation: "Two sequences, same direction",
      link: "https://leetcode.com/problems/is-subsequence/",
      question: [
        "Given two strings s and t, return true if s is a subsequence of t, or false otherwise. A subsequence is formed by deleting some (possibly zero) characters of t without changing the relative order of the remaining characters.",
        "Example 1:\nInput: s = \"abc\", t = \"ahbgdc\"\nOutput: true",
        "Example 2:\nInput: s = \"axc\", t = \"ahbgdc\"\nOutput: false",
        "Constraints:\n- 0 <= s.length <= 100\n- 0 <= t.length <= 10^4\n- s and t consist only of lowercase English letters",
      ],
      code: `bool isSubsequence(string s, string t) {
    int i = 0, j = 0;
    while (i < (int)s.size() && j < (int)t.size()) {
        if (s[i] == t[j]) i++;
        j++;
    }
    return i == (int)s.size();
}`,
      explanation: [
        "Advance a pointer in t on every step, and advance the pointer in s only when the current characters match. Greedily matching the earliest possible occurrence in t never hurts, because any later match leaves fewer characters available for the rest of s.",
        "If the s pointer reaches the end, every character of s was matched in order.",
        "Time: O(|t|). Space: O(1).",
      ],
    },
    {
      name: "Remove Duplicates from Sorted Array",
      difficulty: "Easy",
      variation: "Slow/fast writer pointers",
      link: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
      question: [
        "Given a sorted integer array nums, remove the duplicates in-place so that each unique element appears only once. Keep the relative order and return the number of unique elements k; the first k slots of nums must hold the result.",
        "Example 1:\nInput: nums = [1,1,2]\nOutput: 2, nums = [1,2,_]",
        "Example 2:\nInput: nums = [0,0,1,1,1,2,2,3,3,4]\nOutput: 5, nums = [0,1,2,3,4,_,_,_,_,_]",
        "Constraints:\n- 1 <= nums.length <= 3 * 10^4\n- -100 <= nums[i] <= 100\n- nums is sorted in non-decreasing order",
      ],
      code: `int removeDuplicates(vector<int>& nums) {
    int write = 1;
    for (int read = 1; read < (int)nums.size(); read++) {
        if (nums[read] != nums[write - 1]) {
            nums[write++] = nums[read];
        }
    }
    return write;
}`,
      explanation: [
        "A fast pointer scans every element while a slow pointer marks the next write position. Because the array is sorted, duplicates are adjacent, so an element is kept exactly when it differs from the last value written.",
        "The write pointer never passes the read pointer, so copying in-place is safe and nothing kept is ever overwritten.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Move Zeroes",
      difficulty: "Easy",
      variation: "Slow/fast writer pointers",
      link: "https://leetcode.com/problems/move-zeroes/",
      question: [
        "Given an integer array nums, move all 0s to the end of it while maintaining the relative order of the non-zero elements. You must do this in-place without making a copy of the array.",
        "Example 1:\nInput: nums = [0,1,0,3,12]\nOutput: [1,3,12,0,0]",
        "Constraints:\n- 1 <= nums.length <= 10^4\n- -2^31 <= nums[i] <= 2^31 - 1",
      ],
      code: `void moveZeroes(vector<int>& nums) {
    int write = 0;
    for (int read = 0; read < (int)nums.size(); read++) {
        if (nums[read] != 0) {
            swap(nums[write], nums[read]);
            write++;
        }
    }
}`,
      explanation: [
        "The write pointer marks the position where the next non-zero value belongs. Every time the read pointer finds a non-zero, swapping it into the write slot pushes a zero (or the element itself) to the right while preserving the order of non-zeros.",
        "Everything before write is non-zero and in original order; everything between write and read is zero, so the invariant guarantees correctness at the end.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Merge Sorted Array",
      difficulty: "Easy",
      variation: "Merge from the back",
      link: "https://leetcode.com/problems/merge-sorted-array/",
      question: [
        "You are given two sorted arrays nums1 and nums2, with m and n valid elements respectively. nums1 has length m + n, with the last n slots set to 0 as scratch space. Merge nums2 into nums1 so nums1 becomes one sorted array, in-place.",
        "Example 1:\nInput: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3\nOutput: [1,2,2,3,5,6]",
        "Constraints:\n- nums1.length == m + n\n- nums2.length == n\n- 0 <= m, n <= 200\n- -10^9 <= nums1[i], nums2[j] <= 10^9",
      ],
      code: `void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {
    int i = m - 1, j = n - 1, k = m + n - 1;
    while (j >= 0) {
        if (i >= 0 && nums1[i] > nums2[j]) {
            nums1[k--] = nums1[i--];
        } else {
            nums1[k--] = nums2[j--];
        }
    }
}`,
      explanation: [
        "Filling from the back places the largest remaining element into the last empty slot, so no unread value in nums1 is ever overwritten - the write index k always stays at or ahead of the read index i.",
        "The loop only needs to run while nums2 has elements; anything left in nums1 is already in position.",
        "Time: O(m + n). Space: O(1).",
      ],
    },
    {
      name: "Squares of a Sorted Array",
      difficulty: "Easy",
      variation: "Opposite-end pointers, fill from the back",
      link: "https://leetcode.com/problems/squares-of-a-sorted-array/",
      question: [
        "Given an integer array nums sorted in non-decreasing order, return an array of the squares of each number, also sorted in non-decreasing order, in O(n) time.",
        "Example 1:\nInput: nums = [-4,-1,0,3,10]\nOutput: [0,1,9,16,100]",
        "Constraints:\n- 1 <= nums.length <= 10^4\n- -10^4 <= nums[i] <= 10^4\n- nums is sorted in non-decreasing order",
      ],
      code: `vector<int> sortedSquares(vector<int>& nums) {
    int n = nums.size();
    vector<int> res(n);
    int l = 0, r = n - 1;
    for (int k = n - 1; k >= 0; k--) {
        int left = nums[l] * nums[l];
        int right = nums[r] * nums[r];
        if (left > right) {
            res[k] = left;
            l++;
        } else {
            res[k] = right;
            r--;
        }
    }
    return res;
}`,
      explanation: [
        "After squaring, the largest values sit at the two ends of the array (most negative or most positive). Comparing the two end squares and writing the bigger one into the back of the result consumes elements in exactly non-increasing order of their squares.",
        "Each step retires one element, so a single pass produces the fully sorted output without any sorting.",
        "Time: O(n). Space: O(n) for the output array.",
      ],
    },
    {
      name: "Intersection of Two Arrays II",
      difficulty: "Easy",
      variation: "Two sorted sequences, same direction",
      link: "https://leetcode.com/problems/intersection-of-two-arrays-ii/",
      question: [
        "Given two integer arrays nums1 and nums2, return an array of their intersection. Each element in the result must appear as many times as it shows in both arrays. Solve it with the sorted two-pointer approach.",
        "Example 1:\nInput: nums1 = [1,2,2,1], nums2 = [2,2]\nOutput: [2,2]",
        "Example 2:\nInput: nums1 = [4,9,5], nums2 = [9,4,9,8,4]\nOutput: [4,9] (order may vary)",
        "Constraints:\n- 1 <= nums1.length, nums2.length <= 1000\n- 0 <= nums1[i], nums2[i] <= 1000",
      ],
      code: `vector<int> intersect(vector<int>& nums1, vector<int>& nums2) {
    sort(nums1.begin(), nums1.end());
    sort(nums2.begin(), nums2.end());
    vector<int> res;
    int i = 0, j = 0;
    while (i < (int)nums1.size() && j < (int)nums2.size()) {
        if (nums1[i] < nums2[j]) {
            i++;
        } else if (nums1[i] > nums2[j]) {
            j++;
        } else {
            res.push_back(nums1[i]);
            i++;
            j++;
        }
    }
    return res;
}`,
      explanation: [
        "After sorting both arrays, advance the pointer at the smaller value - that value can never match anything later in the other array, so skipping it is safe. On equality, record the value and advance both, which naturally handles duplicate multiplicity.",
        "Time: O(n log n + m log m) for sorting, O(n + m) for the merge scan. Space: O(1) beyond the output.",
      ],
    },
    {
      name: "Backspace String Compare",
      difficulty: "Easy",
      variation: "Scan from the back",
      link: "https://leetcode.com/problems/backspace-string-compare/",
      question: [
        "Given two strings s and t, return true if they are equal when both are typed into empty text editors. The character '#' means a backspace. Solve it in O(n) time and O(1) space.",
        "Example 1:\nInput: s = \"ab#c\", t = \"ad#c\"\nOutput: true\nExplanation: Both become \"ac\".",
        "Example 2:\nInput: s = \"a#c\", t = \"b\"\nOutput: false",
        "Constraints:\n- 1 <= s.length, t.length <= 200\n- s and t only contain lowercase letters and '#' characters",
      ],
      code: `bool backspaceCompare(string s, string t) {
    int i = (int)s.size() - 1, j = (int)t.size() - 1;
    int skipS = 0, skipT = 0;
    while (i >= 0 || j >= 0) {
        while (i >= 0) {
            if (s[i] == '#') { skipS++; i--; }
            else if (skipS > 0) { skipS--; i--; }
            else break;
        }
        while (j >= 0) {
            if (t[j] == '#') { skipT++; j--; }
            else if (skipT > 0) { skipT--; j--; }
            else break;
        }
        if (i >= 0 && j >= 0) {
            if (s[i] != t[j]) return false;
        } else if (i >= 0 || j >= 0) {
            return false;
        }
        i--;
        j--;
    }
    return true;
}`,
      explanation: [
        "A backspace only affects characters to its left, so scanning from the right lets you know immediately whether a character survives: count '#' symbols as skips and consume that many letters.",
        "Each iteration lands both pointers on the next surviving character (or past the start). The strings are equal exactly when these surviving characters match pairwise and both run out together.",
        "Time: O(n + m). Space: O(1).",
      ],
    },
    {
      name: "Two Sum II - Input Array Is Sorted",
      difficulty: "Medium",
      variation: "Opposite-end pointers",
      link: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
      question: [
        "Given a 1-indexed array numbers sorted in non-decreasing order and a target, find two numbers that add up to target and return their 1-based indices [index1, index2] with index1 < index2. Exactly one solution exists; you may not use the same element twice and must use O(1) extra space.",
        "Example 1:\nInput: numbers = [2,7,11,15], target = 9\nOutput: [1,2]",
        "Constraints:\n- 2 <= numbers.length <= 3 * 10^4\n- -1000 <= numbers[i] <= 1000\n- numbers is sorted in non-decreasing order\n- -1000 <= target <= 1000",
      ],
      code: `vector<int> twoSum(vector<int>& numbers, int target) {
    int l = 0, r = (int)numbers.size() - 1;
    while (l < r) {
        int sum = numbers[l] + numbers[r];
        if (sum == target) return {l + 1, r + 1};
        if (sum < target) l++;
        else r--;
    }
    return {};
}`,
      explanation: [
        "With the array sorted, a too-small sum can only be fixed by moving the left pointer right, and a too-large sum by moving the right pointer left - each move safely discards one element that cannot be part of any answer.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Remove Duplicates from Sorted Array II",
      difficulty: "Medium",
      variation: "Slow/fast writer, keep at most K copies",
      link: "https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/",
      question: [
        "Given a sorted integer array nums, remove some duplicates in-place so that each unique element appears at most twice. Keep the relative order and return the new length k; the first k slots of nums must hold the result. Use O(1) extra memory.",
        "Example 1:\nInput: nums = [1,1,1,2,2,3]\nOutput: 5, nums = [1,1,2,2,3,_]",
        "Example 2:\nInput: nums = [0,0,1,1,1,1,2,3,3]\nOutput: 7, nums = [0,0,1,1,2,3,3,_,_]",
        "Constraints:\n- 1 <= nums.length <= 3 * 10^4\n- -10^4 <= nums[i] <= 10^4\n- nums is sorted in non-decreasing order",
      ],
      code: `int removeDuplicates(vector<int>& nums) {
    int write = 0;
    for (int read = 0; read < (int)nums.size(); read++) {
        if (write < 2 || nums[read] != nums[write - 2]) {
            nums[write++] = nums[read];
        }
    }
    return write;
}`,
      explanation: [
        "Accept a value only if it differs from the element two positions behind the write pointer. In a sorted array, matching nums[write - 2] would make this the third copy in a row, so the check enforces the at-most-two rule with a single comparison.",
        "The same template generalizes to at most K copies by comparing against nums[write - K].",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Sort Colors",
      difficulty: "Medium",
      variation: "Dutch national flag, three pointers",
      link: "https://leetcode.com/problems/sort-colors/",
      question: [
        "Given an array nums with n objects colored red (0), white (1), or blue (2), sort them in-place so that objects of the same color are adjacent, in the order red, white, blue. Do it in one pass with constant extra space, without the library sort.",
        "Example 1:\nInput: nums = [2,0,2,1,1,0]\nOutput: [0,0,1,1,2,2]",
        "Constraints:\n- n == nums.length\n- 1 <= n <= 300\n- nums[i] is 0, 1, or 2",
      ],
      code: `void sortColors(vector<int>& nums) {
    int low = 0, mid = 0, high = (int)nums.size() - 1;
    while (mid <= high) {
        if (nums[mid] == 0) {
            swap(nums[low++], nums[mid++]);
        } else if (nums[mid] == 1) {
            mid++;
        } else {
            swap(nums[mid], nums[high--]);
        }
    }
}`,
      explanation: [
        "Maintain three regions: everything before low is 0, between low and mid is 1, and after high is 2. The mid pointer classifies each unknown element and swaps it into the correct region.",
        "After swapping a 0 forward, the incoming element is a known 1, so mid can advance; after swapping a 2 backward, the incoming element is unclassified, so mid must stay put and re-examine it.",
        "Time: O(n), single pass. Space: O(1).",
      ],
    },
    {
      name: "Container With Most Water",
      difficulty: "Medium",
      variation: "Opposite-end pointers, greedy shrink",
      link: "https://leetcode.com/problems/container-with-most-water/",
      question: [
        "You are given an integer array height of length n. There are n vertical lines where the i-th line spans from (i, 0) to (i, height[i]). Find two lines that, together with the x-axis, form a container holding the most water, and return that maximum amount.",
        "Example 1:\nInput: height = [1,8,6,2,5,4,8,3,7]\nOutput: 49\nExplanation: Lines at indices 1 and 8 give min(8,7) * 7 = 49.",
        "Constraints:\n- n == height.length\n- 2 <= n <= 10^5\n- 0 <= height[i] <= 10^4",
      ],
      code: `int maxArea(vector<int>& height) {
    int l = 0, r = (int)height.size() - 1;
    int best = 0;
    while (l < r) {
        int area = min(height[l], height[r]) * (r - l);
        best = max(best, area);
        if (height[l] < height[r]) l++;
        else r--;
    }
    return best;
}`,
      explanation: [
        "The area is limited by the shorter line. Moving the taller pointer inward can never help: the width shrinks and the height stays capped by the same shorter line. So moving the shorter pointer is the only move that might improve the area.",
        "This means every discarded pair provably cannot beat the best already recorded, and one linear pass suffices.",
        "Time: O(n). Space: O(1).",
      ],
    },
    {
      name: "Boats to Save People",
      difficulty: "Medium",
      variation: "Sort + opposite-end greedy pairing",
      link: "https://leetcode.com/problems/boats-to-save-people/",
      question: [
        "You are given an array people where people[i] is the weight of the i-th person, and each boat carries at most two people at the same time provided their weight sum is at most limit. Return the minimum number of boats to carry every person. Each person weighs at most limit.",
        "Example 1:\nInput: people = [3,2,2,1], limit = 3\nOutput: 3\nExplanation: Boats (1,2), (2), (3).",
        "Constraints:\n- 1 <= people.length <= 5 * 10^4\n- 1 <= people[i] <= limit <= 3 * 10^4",
      ],
      code: `int numRescueBoats(vector<int>& people, int limit) {
    sort(people.begin(), people.end());
    int l = 0, r = (int)people.size() - 1;
    int boats = 0;
    while (l <= r) {
        if (people[l] + people[r] <= limit) {
            l++;
        }
        r--;
        boats++;
    }
    return boats;
}`,
      explanation: [
        "Sort the weights, then always ship the heaviest remaining person. If the lightest remaining person also fits alongside, pair them - if the lightest cannot share a boat with the heaviest, nobody can, so the heaviest must go alone.",
        "Each iteration removes the heaviest (and possibly the lightest), so the greedy pairing is exchange-argument optimal.",
        "Time: O(n log n). Space: O(1) beyond the sort.",
      ],
    },
    {
      name: "3Sum",
      difficulty: "Medium",
      variation: "Fix one, opposite-end pointers inside",
      link: "https://leetcode.com/problems/3sum/",
      question: [
        "Given an integer array nums, return all unique triplets [nums[i], nums[j], nums[k]] such that i, j, k are distinct and nums[i] + nums[j] + nums[k] == 0. The solution set must not contain duplicate triplets.",
        "Example 1:\nInput: nums = [-1,0,1,2,-1,-4]\nOutput: [[-1,-1,2],[-1,0,1]]",
        "Constraints:\n- 3 <= nums.length <= 3000\n- -10^5 <= nums[i] <= 10^5",
      ],
      code: `vector<vector<int>> threeSum(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    vector<vector<int>> res;
    int n = nums.size();
    for (int i = 0; i < n - 2; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        if (nums[i] > 0) break;
        int l = i + 1, r = n - 1;
        while (l < r) {
            int sum = nums[i] + nums[l] + nums[r];
            if (sum < 0) {
                l++;
            } else if (sum > 0) {
                r--;
            } else {
                res.push_back({nums[i], nums[l], nums[r]});
                while (l < r && nums[l] == nums[l + 1]) l++;
                while (l < r && nums[r] == nums[r - 1]) r--;
                l++;
                r--;
            }
        }
    }
    return res;
}`,
      explanation: [
        "Sort the array, fix the smallest element of the triplet, and solve the remaining two-sum with opposite-end pointers on the suffix - sortedness makes each pointer move a safe elimination, exactly as in Two Sum II.",
        "Duplicates are skipped at both levels: repeated anchor values are skipped in the outer loop, and after recording a triplet both inner pointers jump past equal neighbors, so every emitted triplet is unique without a set.",
        "Time: O(n^2). Space: O(1) beyond the output.",
      ],
    },
    {
      name: "3Sum Closest",
      difficulty: "Medium",
      variation: "Fix one, track closest sum",
      link: "https://leetcode.com/problems/3sum-closest/",
      question: [
        "Given an integer array nums and an integer target, find three integers in nums whose sum is closest to target and return that sum. Each input has exactly one such closest sum.",
        "Example 1:\nInput: nums = [-1,2,1,-4], target = 1\nOutput: 2\nExplanation: The closest sum is -1 + 2 + 1 = 2.",
        "Constraints:\n- 3 <= nums.length <= 500\n- -1000 <= nums[i] <= 1000\n- -10^4 <= target <= 10^4",
      ],
      code: `int threeSumClosest(vector<int>& nums, int target) {
    sort(nums.begin(), nums.end());
    int n = nums.size();
    int best = nums[0] + nums[1] + nums[2];
    for (int i = 0; i < n - 2; i++) {
        int l = i + 1, r = n - 1;
        while (l < r) {
            int sum = nums[i] + nums[l] + nums[r];
            if (abs(sum - target) < abs(best - target)) best = sum;
            if (sum == target) return target;
            if (sum < target) l++;
            else r--;
        }
    }
    return best;
}`,
      explanation: [
        "Same skeleton as 3Sum: fix the first element and sweep two pointers over the sorted suffix. Instead of demanding an exact hit, record the sum whenever it beats the closest seen so far.",
        "When the sum is below target only moving the left pointer can bring it closer, and symmetrically for above - so no candidate closer to the target is ever skipped.",
        "Time: O(n^2). Space: O(1).",
      ],
    },
    {
      name: "Partition Labels",
      difficulty: "Medium",
      variation: "Greedy interval merge with last-occurrence pointer",
      link: "https://leetcode.com/problems/partition-labels/",
      question: [
        "You are given a string s. Partition it into as many parts as possible so that each letter appears in at most one part, and the concatenation of the parts in order equals s. Return a list of the sizes of these parts.",
        "Example 1:\nInput: s = \"ababcbacadefegdehijhklij\"\nOutput: [9,7,8]\nExplanation: The partition is \"ababcbaca\", \"defegde\", \"hijhklij\".",
        "Constraints:\n- 1 <= s.length <= 500\n- s consists of lowercase English letters",
      ],
      code: `vector<int> partitionLabels(string s) {
    int last[26];
    for (int i = 0; i < (int)s.size(); i++) {
        last[s[i] - 'a'] = i;
    }
    vector<int> res;
    int start = 0, end = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        end = max(end, last[s[i] - 'a']);
        if (i == end) {
            res.push_back(end - start + 1);
            start = i + 1;
        }
    }
    return res;
}`,
      explanation: [
        "Precompute the last index of every letter. While scanning, keep an end pointer at the farthest last-occurrence seen inside the current part - every letter met so far must be contained, so the part cannot close before end.",
        "When the scan index reaches end, no letter inside the part appears later, so cutting here is safe and greedy-maximal: any earlier cut would split a letter, any later cut only merges valid parts.",
        "Time: O(n). Space: O(1) - the table has a fixed 26 entries.",
      ],
    },
    {
      name: "4Sum",
      difficulty: "Medium",
      variation: "Fix two, opposite-end pointers inside",
      link: "https://leetcode.com/problems/4sum/",
      question: [
        "Given an array nums of n integers, return all unique quadruplets [nums[a], nums[b], nums[c], nums[d]] with distinct indices such that the four values sum to target.",
        "Example 1:\nInput: nums = [1,0,-1,0,-2,2], target = 0\nOutput: [[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]",
        "Constraints:\n- 1 <= nums.length <= 200\n- -10^9 <= nums[i] <= 10^9\n- -10^9 <= target <= 10^9",
      ],
      code: `vector<vector<int>> fourSum(vector<int>& nums, int target) {
    sort(nums.begin(), nums.end());
    vector<vector<int>> res;
    int n = nums.size();
    for (int i = 0; i < n - 3; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        for (int j = i + 1; j < n - 2; j++) {
            if (j > i + 1 && nums[j] == nums[j - 1]) continue;
            long long need = (long long)target - nums[i] - nums[j];
            int l = j + 1, r = n - 1;
            while (l < r) {
                long long sum = (long long)nums[l] + nums[r];
                if (sum < need) {
                    l++;
                } else if (sum > need) {
                    r--;
                } else {
                    res.push_back({nums[i], nums[j], nums[l], nums[r]});
                    while (l < r && nums[l] == nums[l + 1]) l++;
                    while (l < r && nums[r] == nums[r - 1]) r--;
                    l++;
                    r--;
                }
            }
        }
    }
    return res;
}`,
      explanation: [
        "Extend the 3Sum pattern one level: fix the two smallest elements with nested loops and close the quadruplet with opposite-end pointers on the sorted suffix.",
        "Sums are computed in long long because values up to 10^9 can overflow int when added. Duplicate skipping at all three levels keeps the output set unique.",
        "Time: O(n^3). Space: O(1) beyond the output.",
      ],
    },
    {
      name: "Trapping Rain Water",
      difficulty: "Hard",
      variation: "Opposite-end pointers with running maxima",
      link: "https://leetcode.com/problems/trapping-rain-water/",
      question: [
        "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
        "Example 1:\nInput: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6",
        "Example 2:\nInput: height = [4,2,0,3,2,5]\nOutput: 9",
        "Constraints:\n- n == height.length\n- 1 <= n <= 2 * 10^4\n- 0 <= height[i] <= 10^5",
      ],
      code: `int trap(vector<int>& height) {
    int l = 0, r = (int)height.size() - 1;
    int leftMax = 0, rightMax = 0;
    int water = 0;
    while (l < r) {
        if (height[l] < height[r]) {
            leftMax = max(leftMax, height[l]);
            water += leftMax - height[l];
            l++;
        } else {
            rightMax = max(rightMax, height[r]);
            water += rightMax - height[r];
            r--;
        }
    }
    return water;
}`,
      explanation: [
        "Water above a bar equals min(highest wall to its left, highest wall to its right) minus its own height. Walking pointers inward from both ends, whichever side is currently lower is processed, because the taller opposite side guarantees the true limiting wall is the running max on the lower side.",
        "That guarantee is what makes the O(1)-space variant work: when height[l] < height[r], some wall at least height[r] tall exists to the right, so leftMax alone decides the water at l.",
        "Time: O(n). Space: O(1).",
      ],
    },
  ],
};
