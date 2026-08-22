import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Rotate String",
      difficulty: "Easy",
      variation: "Rotation membership via doubling",
      link: "https://leetcode.com/problems/rotate-string/",
      question: [
        "Given two strings s and goal, return true if and only if s can become goal after some number of shifts. One shift moves the leftmost character of s to the rightmost position, so a shift turns 'abcde' into 'bcdea'.",
        "Example 1:\nInput: s = 'abcde', goal = 'cdeab'\nOutput: true\nExplanation: Two shifts turn 'abcde' into 'cdeab': 'abcde' -> 'bcdea' -> 'cdeab'.",
        "Example 2:\nInput: s = 'abcde', goal = 'abced'\nOutput: false\nExplanation: The two strings are anagrams but no cyclic shift of 'abcde' equals 'abced'.",
        "Constraints:\n- 1 <= s.length, goal.length <= 100\n- s and goal consist of lowercase English letters",
      ],
      code: `bool rotateString(string s, string goal) {
    if (s.size() != goal.size()) return false;
    // every rotation of s appears as a length-n window of s+s
    return (s + s).find(goal) != string::npos;
}`,
      explanation: [
        "The whole rotation family of a string of length n is exactly the set of n length-n windows of s+s starting at offsets 0..n-1. So asking 'is goal a rotation of s' is the same as asking 'is goal a substring of s+s', once the lengths match.",
        "The length check is not cosmetic. Without it, a shorter goal such as 'bcd' would be found inside 'abcdeabcde' and wrongly reported as a rotation.",
        "The tempting wrong approach is to build all n rotations explicitly and compare each one; that is O(n^2) work and, more importantly, it hides the doubling identity that every later problem in this topic leans on.",
        "find on a doubled string is what the library gives you; if you need worst-case linear time write KMP over the pattern goal and the text s+s instead.",
        "Time: O(n^2) worst case with std::string::find, O(n) with a KMP search. Space: O(n) for the doubled string.",
      ],
    },
    {
      name: "Minimum Rotations Required to Get the Same String",
      difficulty: "Easy",
      variation: "Smallest rotation that is a fixed point",
      question: [
        "Given a string s, find the minimum number of cyclic left rotations, at least one, needed to obtain the same string back. Rotating 'abc' once gives 'bca'.",
        "Example 1:\nInput: s = 'geeks'\nOutput: 5\nExplanation: No proper rotation of 'geeks' equals 'geeks', so only a full rotation by 5 restores it.",
        "Example 2:\nInput: s = 'abab'\nOutput: 2\nExplanation: One rotation gives 'baba', two rotations give 'abab' again.",
        "Constraints:\n- 1 <= s.length <= 10^5\n- s consists of printable ASCII characters",
      ],
      code: `int minRotations(const string& s) {
    string t = s + s;
    // the first occurrence of s in s+s after index 0 is the answer;
    // it always exists at index n, so no npos check is needed
    return (int)t.find(s, 1);
}`,
      explanation: [
        "Rotating left by k gives the window of s+s that starts at index k. So the answer is the smallest k >= 1 with s+s occurring as s at offset k, which is exactly the smallest period of s that divides n.",
        "Searching from index 1 rather than 0 is the whole trick: index 0 is the trivial match. The search can never fail because offset n always matches, which is why the full rotation count n is the fallback answer.",
        "A common wrong answer is to return the smallest border-based period n - lps[n-1] directly. That period does not have to divide n: for 'abcab' it is 3, but rotating by 3 gives 'ababc', not 'abcab'. Only periods that divide n are fixed points of rotation.",
        "Time: O(n) with a KMP-based search, O(n^2) worst case with a naive find. Space: O(n).",
      ],
    },
    {
      name: "Lexicographically Minimum String Rotation",
      difficulty: "Easy",
      variation: "Naive O(n^2) canonical form, the baseline",
      link: "https://www.geeksforgeeks.org/lexicographically-minimum-string-rotation/",
      question: [
        "Given a string s, return its lexicographically smallest rotation. That is, among the n strings obtained by cyclically shifting s by 0, 1, ..., n-1 positions, return the smallest one. Solve it with the straightforward compare-every-rotation method so the linear algorithm later has a reference to be checked against.",
        "Example 1:\nInput: s = 'GEEKSFORGEEKS'\nOutput: 'EEKSFORGEEKSG'\nExplanation: The rotations starting at the four 'E' positions are the only candidates; 'EEKSFORGEEKSG' beats 'EEKSGEEKSFORG' at index 4 because 'F' < 'G'.",
        "Example 2:\nInput: s = 'cba'\nOutput: 'acb'\nExplanation: The rotations are 'cba', 'bac' and 'acb'; the last is smallest.",
        "Constraints:\n- 1 <= s.length <= 2000\n- s consists of printable ASCII characters",
      ],
      code: `string minRotationNaive(const string& s) {
    int n = s.size();
    string t = s + s;
    int best = 0;
    for (int i = 1; i < n; i++) {
        // compare the length-n windows at i and at best without copying them
        if (t.compare(i, n, t, best, n) < 0) best = i;
    }
    return t.substr(best, n);
}`,
      explanation: [
        "Because every rotation is a length-n window of s+s, choosing the minimum rotation is choosing the starting offset in 0..n-1 whose window is smallest. compare(i, n, t, best, n) does that comparison in place, so no rotation is ever materialised.",
        "The offset, not the string, is the real answer: keeping best as an index means ties are resolved toward the smaller starting position for free, which is what the index-reporting problems later in this topic ask for.",
        "This is O(n^2) in the worst case and that worst case is easy to hit: on 'aaaa...a' every comparison runs the full n characters. Strings like 'a' repeated 10^6 times are exactly why Booth's algorithm exists.",
        "Do not shortcut by only comparing rotations that start with the globally smallest character. It prunes the common case but does not change the worst case, and it is a frequent source of off-by-one bugs.",
        "Time: O(n^2). Space: O(n).",
      ],
    },
    {
      name: "Minimal Rotation",
      difficulty: "Medium",
      variation: "Booth / least-rotation two pointers in O(n) time, O(1) space",
      question: [
        "A rotation of a string is produced by repeatedly moving its first character to the end. Given a string, print its lexicographically minimal rotation. The input can be up to a million characters, so the quadratic method will not pass.",
        "Example 1:\nInput:\nacbab\nOutput: abacb\nExplanation: The rotations are 'acbab', 'cbaba', 'babac', 'abacb' and 'bacba'; 'abacb' is the smallest.",
        "Example 2:\nInput:\nbbab\nOutput: abbb\nExplanation: The rotations are 'bbab', 'babb', 'abbb' and 'bbba'; the rotation starting at index 2 wins.",
        "Constraints:\n- 1 <= string length <= 10^6\n- the string consists of lowercase English letters",
      ],
      code: `// Returns the starting index of the lexicographically smallest rotation.
// Smallest such index on ties, so equal rotations resolve deterministically.
int leastRotation(const string& s) {
    int n = s.size();
    int i = 0, j = 1, k = 0;   // two candidate starts, k = length already matched
    while (i < n && j < n && k < n) {
        char a = s[(i + k) % n], b = s[(j + k) % n];
        if (a == b) { k++; continue; }
        // the loser cannot start the minimum, and neither can any start
        // strictly inside the k characters it already matched
        if (a > b) i = i + k + 1;
        else j = j + k + 1;
        if (i == j) j++;
        k = 0;
    }
    return min(i, j);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int p = leastRotation(s);
    cout << s.substr(p) << s.substr(0, p) << "\\n";
    return 0;
}`,
      explanation: [
        "State is a pair of surviving candidate starts i and j plus the number k of characters for which the rotations from i and from j agree. At every step the invariant is that the true minimum start is i, j, or some index greater than both.",
        "The elimination step is the heart of it. Suppose the rotations agree on k characters and then s[i+k] > s[j+k], so i loses. Then every start i+t for 0 <= t <= k also loses: it is beaten by j+t, because the block s[i..i+k] equals s[j..j+k] character for character up to the mismatch, and after the mismatch the j-side is smaller. So i can jump all the way to i+k+1 and nothing between is skipped wrongly. This is why the total advance of i plus j is bounded by 2n.",
        "The modular indexing is what makes this work on rotations rather than suffixes: (i+k) % n wraps around instead of falling off the end, so no doubled copy of the string is needed and the extra space stays constant.",
        "Two details bite people. Forgetting if (i == j) j++ lets both pointers collapse onto the same start and the loop compares a rotation with itself forever. And returning i instead of min(i, j) is wrong whenever the loser was pushed past n on the final step.",
        "For the lexicographically largest rotation, run the same routine with the comparison reversed (swap the roles of a > b and a < b). Nothing else changes.",
        "Time: O(n). Space: O(1) beyond the input and the printed answer.",
      ],
    },
    {
      name: "Glass Beads",
      difficulty: "Medium",
      variation: "Report the 1-based index of the minimal rotation",
      link: "https://www.spoj.com/problems/BEADS/",
      question: [
        "A necklace is a cyclic sequence of beads, each labelled with a lowercase letter. Cutting the necklace between two beads and reading it clockwise produces a string, and different cut points produce different rotations of the same cyclic word. For each necklace, find the cut point that produces the lexicographically smallest string and print the 1-based position of the bead that becomes first. If several cut points give the same smallest string, print the smallest such position.",
        "Example 1:\nInput:\n4\nhelloworld\namandamanda\ndontcallmebfu\naaabaaa\nOutput:\n10\n11\n6\n5\nExplanation: In 'helloworld' the only 'd' sits at 1-based position 10, so the smallest reading is 'dhelloworl'. In 'aaabaaa' the cut at position 5 reads 'aaaaaab', which beats 'aaabaaa' and 'aabaaaa'.",
        "Constraints:\n- 1 <= number of test cases <= 100\n- 1 <= necklace length <= 10000\n- beads are lowercase English letters",
      ],
      code: `int leastRotation(const string& s) {
    int n = s.size();
    int i = 0, j = 1, k = 0;
    while (i < n && j < n && k < n) {
        char a = s[(i + k) % n], b = s[(j + k) % n];
        if (a == b) { k++; continue; }
        if (a > b) i = i + k + 1;
        else j = j + k + 1;
        if (i == j) j++;
        k = 0;
    }
    return min(i, j);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        string s;
        cin >> s;
        cout << leastRotation(s) + 1 << "\\n";   // judge wants a 1-based cut point
    }
    return 0;
}`,
      explanation: [
        "This is the pure statement of the pattern: the necklace is a cyclic word, the readings are its rotations, and the answer is the canonical starting offset. Only the reporting changes, from the rotated string to its 1-based index.",
        "The tie rule matters here and it is free. Because the algorithm only ever advances the losing pointer and returns min(i, j), the surviving index is the smallest start among all starts that produce the minimal rotation. A periodic necklace such as 'abab' therefore answers 1, not 3.",
        "Quadratic comparison would be 10^8 character comparisons across 100 necklaces of length 10^4, and the adversarial input for it, a necklace of identical beads, is trivial to construct. The linear routine is not an optimisation here, it is the solution.",
        "Time: O(total length) over all test cases. Space: O(1) beyond the input string.",
      ],
    },
    {
      name: "Secret Combination",
      difficulty: "Medium",
      variation: "Rotations combined with a second operation",
      link: "https://codeforces.com/problemset/problem/496/B",
      question: [
        "You have a lock displaying n digits. Two operations may be applied any number of times in any order: add 1 to every digit at once, where 9 becomes 0; or shift all digits cyclically by one position. Print the smallest number, as a string of exactly n digits and keeping any leading zeros, that can appear on the display.",
        "Example 1:\nInput:\n3\n579\nOutput: 024\nExplanation: Five 'add one' operations turn 579 into 024, and no rotation of 024 is smaller.",
        "Example 2:\nInput:\n4\n2014\nOutput: 0142\nExplanation: Three shifts give 0142. Every other rotation needs a non-zero number of additions to start with 0, and those all lose later: 2014 becomes 0892, 4201 becomes 0867, 1420 becomes 0319.",
        "Constraints:\n- 1 <= n <= 1000\n- the display consists of exactly n decimal digits",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    string s;
    cin >> n >> s;
    string t = s + s;
    string best = "";
    for (int start = 0; start < n; start++) {
        string rot = t.substr(start, n);
        // the only addition worth trying is the one that zeroes the lead digit
        int add = (10 - (rot[0] - '0')) % 10;
        string cand = rot;
        for (char& c : cand) c = '0' + (c - '0' + add) % 10;
        if (best.empty() || cand < best) best = cand;
    }
    cout << best << "\\n";
    return 0;
}`,
      explanation: [
        "The two operations commute and neither destroys information, so any reachable display is 'rotate by some k, then add some d', giving at most 10n candidates. Enumerating rotations through the doubled string keeps that enumeration trivial.",
        "The d loop collapses to a single value. For a fixed rotation, the first digit is the highest-order digit, so the smallest candidate must make it 0; any d that leaves a non-zero lead digit is beaten immediately. That leaves exactly n candidates, one per rotation.",
        "Note that the canonical-rotation trick from Booth's algorithm does not apply directly, because the addition is performed after the rotation and changes the character ordering. The minimal rotation of the original digits is not necessarily the rotation that wins after normalising the lead digit - 2014 shows this, where the minimal rotation 0142 happens to win only because its required addition is 0.",
        "Comparing full strings is fine at n <= 1000: n candidates of length n is a million character comparisons.",
        "Time: O(n^2). Space: O(n).",
      ],
    },
    {
      name: "Lexicographically Smallest String After Applying Operations",
      difficulty: "Medium",
      variation: "Reachable rotations as a search space",
      link: "https://leetcode.com/problems/lexicographically-smallest-string-after-applying-operations/",
      question: [
        "You are given a string s of even length consisting of digits, and two integers a and b. You may apply either operation any number of times: add a to all digits at odd indices of s, where each digit wraps modulo 10; or rotate s to the right by b positions. Return the lexicographically smallest string that s can become.",
        "Example 1:\nInput: s = '74', a = 5, b = 1\nOutput: '24'\nExplanation: Rotating gives '47', adding 5 to index 1 gives '42', rotating gives '24'.",
        "Example 2:\nInput: s = '0011', a = 4, b = 2\nOutput: '0011'\nExplanation: b = 2 keeps every digit on its original parity, and adding 4 to the odd positions of '0011' only makes them larger, so nothing beats the original string.",
        "Constraints:\n- 2 <= s.length <= 100, s.length is even\n- s consists of digits only\n- 1 <= a <= 9\n- 1 <= b <= s.length - 1",
      ],
      code: `string findLexSmallestString(string s, int a, int b) {
    int n = s.size();
    set<string> seen{s};
    queue<string> q;
    q.push(s);
    string best = s;
    while (!q.empty()) {
        string cur = q.front(); q.pop();
        best = min(best, cur);
        string add = cur;
        for (int i = 1; i < n; i += 2) add[i] = '0' + (add[i] - '0' + a) % 10;
        if (seen.insert(add).second) q.push(add);
        string rot = cur.substr(n - b) + cur.substr(0, n - b);   // right rotation by b
        if (seen.insert(rot).second) q.push(rot);
        // best is tracked on pop, so every reachable string is considered
    }
    return best;
}`,
      explanation: [
        "The reachable set is closed under the two moves and is small: the rotation move generates only the multiples of b modulo n, and each addition move adds a fixed amount to one parity class, so there are at most 10 * 10 * n distinct strings. A plain BFS with a visited set therefore enumerates everything.",
        "The subtlety that makes brute force necessary rather than greedy is parity. When b is odd, a rotation by b swaps which positions count as odd, so the addition can eventually reach every digit; when b is even the two parity classes stay separate and only half the digits can ever change. Reasoning about which digit to minimise first has to respect that, and getting it wrong is the classic failed greedy here.",
        "Because the addition is applied only to one parity class, minimising the string is not the same as taking a minimal rotation. Booth's algorithm gives the canonical rotation of a fixed string; here the string itself keeps changing, so the pattern shows up only as 'the rotations are the orbit to search over'.",
        "Comparing on pop rather than on push is what guarantees the starting string itself is a candidate, which is exactly the answer in Example 2.",
        "Time: O(n^3 log n) at worst for the at most 100n states, each doing O(n) work plus a set insert. Space: O(n^2) for the visited set.",
      ],
    },
    {
      name: "Orderly Queue",
      difficulty: "Hard",
      variation: "Minimal rotation when k = 1, sorting when k >= 2",
      link: "https://leetcode.com/problems/orderly-queue/",
      question: [
        "You are given a string s and an integer k. In one move, choose one of the first k characters of s and append it to the end of the string. Return the lexicographically smallest string that can be obtained after any number of moves.",
        "Example 1:\nInput: s = 'cba', k = 1\nOutput: 'acb'\nExplanation: With k = 1 only the first character may move, so the reachable strings are exactly the rotations 'cba', 'bac' and 'acb'.",
        "Example 2:\nInput: s = 'baaca', k = 3\nOutput: 'aaabc'\nExplanation: With k = 3 any pair of adjacent characters can be swapped in effect, so every permutation is reachable and the sorted string wins.",
        "Constraints:\n- 1 <= k <= s.length <= 1000\n- s consists of lowercase English letters",
      ],
      code: `int leastRotation(const string& s) {
    int n = s.size();
    int i = 0, j = 1, k = 0;
    while (i < n && j < n && k < n) {
        char a = s[(i + k) % n], b = s[(j + k) % n];
        if (a == b) { k++; continue; }
        if (a > b) i = i + k + 1;
        else j = j + k + 1;
        if (i == j) j++;
        k = 0;
    }
    return min(i, j);
}

string orderlyQueue(string s, int k) {
    if (k > 1) {                       // any permutation is reachable
        sort(s.begin(), s.end());
        return s;
    }
    int p = leastRotation(s);           // k == 1: only rotations are reachable
    return s.substr(p) + s.substr(0, p);
}`,
      explanation: [
        "Everything turns on the case split. With k = 1 the only legal move is 'first character to the back', which is precisely one left rotation, so the reachable set is the rotation family and the answer is the canonical minimal rotation.",
        "With k >= 2 the reachable set is all n! permutations. The argument: take the first two characters x y. Moving x then y to the back reproduces the original cyclic order, but moving y first and then x lands the pair reversed at the end. So an adjacent transposition composed with rotations is available, and adjacent transpositions plus rotations generate the full symmetric group. Hence sorting the multiset of characters is achievable and is obviously optimal.",
        "The trap is treating k as a window size and building a greedy or BFS solution over prefixes of length k. That is both slower and wrong-headed: the answer does not depend on k beyond whether it is 1.",
        "At n <= 1000 the naive quadratic rotation scan also passes, but the linear routine is the one to reach for, because the same code is the whole solution to the necklace problems above.",
        "Time: O(n log n) for k >= 2, O(n) for k = 1. Space: O(n) for the returned string.",
      ],
    },
    {
      name: "Smallest Rotation with Highest Score",
      difficulty: "Hard",
      variation: "Best rotation under a numeric score, difference array",
      link: "https://leetcode.com/problems/smallest-rotation-with-highest-score/",
      question: [
        "You are given an array nums. You may rotate it left by k positions for any k, so index i moves to index (i - k) mod n. After rotating, the array scores one point for every index i where the value at that index is less than or equal to i. Return the smallest rotation amount k that achieves the highest possible score.",
        "Example 1:\nInput: nums = [2,3,1,4,0]\nOutput: 3\nExplanation: k = 3 gives [4,0,2,3,1], which scores at indices 1, 2, 3 and 4 for a total of 4. No other rotation scores more.",
        "Example 2:\nInput: nums = [1,3,0,2,4]\nOutput: 0\nExplanation: Every rotation scores exactly 3, so the smallest k wins.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- 0 <= nums[i] < nums.length",
      ],
      code: `int bestRotation(vector<int>& nums) {
    int n = nums.size();
    vector<int> diff(n + 1, 0);
    for (int i = 0; i < n; i++) {
        int v = nums[i];
        if (v >= n) continue;                 // can never satisfy v <= position
        // no wrap: position i-k, scores while k <= i-v
        if (v <= i) { diff[0]++; diff[i - v + 1]--; }
        // wrap: position i-k+n, scores while i+1 <= k <= i+n-v
        int lo = i + 1, hi = min(n - 1, i + n - v);
        if (lo <= hi) { diff[lo]++; diff[hi + 1]--; }
    }
    int cur = 0, bestScore = -1, bestK = 0;
    for (int k = 0; k < n; k++) {
        cur += diff[k];
        if (cur > bestScore) { bestScore = cur; bestK = k; }   // strict keeps smallest k
    }
    return bestK;
}`,
      explanation: [
        "The rotation is the search space but the objective is numeric, not lexicographic, so Booth's algorithm has nothing to say here. Invert the question instead: rather than scoring each of the n rotations in O(n), ask for each element which set of rotations it scores in.",
        "For element v at index i the new position is i-k when k <= i and i-k+n when k > i. In the first case it scores while k <= i-v, an interval starting at 0; in the second it scores while k <= i+n-v, an interval starting at i+1. Both are contiguous ranges of k, so each element contributes at most two range increments, and a difference array plus one prefix sum turns 2n increments into all n scores.",
        "The dropped case v >= n never happens under the stated constraints but is worth keeping: such an element beats no position at all, and an unguarded interval computation would produce a negative width or a bogus range.",
        "Using a strict greater-than when scanning the prefix sums is what returns the smallest maximising k. Using >= silently returns the largest one and fails Example 2.",
        "The naive alternative, simulate each rotation and count, is O(n^2) and times out at n = 10^5.",
        "Time: O(n). Space: O(n) for the difference array.",
      ],
    },
    {
      name: "Last Substring in Lexicographical Order",
      difficulty: "Hard",
      variation: "Maximum suffix by the same two-pointer duel",
      link: "https://leetcode.com/problems/last-substring-in-lexicographical-order/",
      question: [
        "Given a string s, return the last substring of s in lexicographical order. Note that the answer is always a suffix of s, since extending a substring to the end of the string can only make it larger.",
        "Example 1:\nInput: s = 'abab'\nOutput: 'bab'\nExplanation: The substrings starting with 'b' are 'b', 'ba', 'bab' and 'b'; the largest is 'bab'.",
        "Example 2:\nInput: s = 'leetcode'\nOutput: 'tcode'\nExplanation: 't' is the largest character and occurs once, so the suffix starting there is the answer.",
        "Constraints:\n- 1 <= s.length <= 4 * 10^5\n- s consists of lowercase English letters",
      ],
      code: `string lastSubstring(string s) {
    int n = s.size();
    int i = 0, j = 1, k = 0;   // i = current best start, j = challenger, k = matched length
    while (j + k < n) {
        if (s[i + k] == s[j + k]) { k++; continue; }
        if (s[i + k] < s[j + k]) {
            i = max(i + k + 1, j);   // i loses; j is the new best, skip the matched block
            j = i + 1;
        } else {
            j = j + k + 1;           // j loses, and so does every start inside its match
        }
        k = 0;
    }
    return s.substr(i);
}`,
      explanation: [
        "This is the linear rotation duel with the comparison flipped to find a maximum and with plain indexing instead of modular indexing, because suffixes stop at the end of the string while rotations wrap. Reading the two side by side is the cleanest way to see what is essential in the technique and what is problem-specific.",
        "Correctness rests on the same block argument. When the two candidates agree on k characters and then s[i+k] < s[j+k], every start from i to i+k is beaten by the corresponding start from j, so all of them can be discarded at once. The max(i+k+1, j) guard is needed because the discarded block may reach past j, and the new best start must be j itself, not something before it.",
        "The maximum suffix is also the direct route to the lexicographically largest rotation: run this on s+s and take the length-n window at the winning start. Symmetrically, the minimum suffix of s+s gives the minimal rotation, which is why Duval's Lyndon factorisation solves both problems.",
        "The trap is the naive 'collect all positions of the largest character, then compare their suffixes'. On a string of a single repeated character that degenerates to O(n^2), and the same input is what breaks a naive minimal-rotation scan.",
        "Each iteration either increments k or advances one pointer by at least k+1, so i + j + k grows every step and the loop runs O(n) times.",
        "Time: O(n). Space: O(1) beyond the returned suffix.",
      ],
    },
  ],
};
