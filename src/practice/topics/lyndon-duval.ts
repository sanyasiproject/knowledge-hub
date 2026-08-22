import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Check if a String is a Lyndon Word",
      difficulty: "Easy",
      variation: "Lyndon word definition, single-factor test",
      question: [
        "A string s is a Lyndon word (also called a simple word) if it is strictly smaller, in lexicographic order, than every one of its proper suffixes. Equivalently, s is strictly smaller than all of its non-trivial rotations, which also forces s to be aperiodic. Given a string s of lowercase letters, decide whether s is a Lyndon word.",
        "Solve it by running Duval's algorithm, which splits any string into a non-increasing sequence of Lyndon factors. s is a Lyndon word exactly when that factorization has a single factor.",
        "Example 1:\nInput: s = 'aab'\nOutput: true\nExplanation: The proper suffixes are 'ab' and 'b', and 'aab' < 'ab' < 'b', so every proper suffix is strictly larger. Duval returns the single factor 'aab'.",
        "Example 2:\nInput: s = 'abab'\nOutput: false\nExplanation: The proper suffix 'ab' is smaller than 'abab', so the strict inequality fails. Duval returns the two factors 'ab' and 'ab'.",
        "Constraints:\n- 1 <= s.length <= 10^6\n- s contains lowercase English letters only",
      ],
      code: `bool isLyndonWord(const string& s) {
    int n = s.size();
    int i = 0, factors = 0;
    while (i < n) {
        int j = i + 1, k = i;   // j scans forward, k trails one period behind
        while (j < n && s[k] <= s[j]) {
            if (s[k] < s[j]) k = i;   // strict rise: restart the period
            else k++;                 // tie: stay in step with the period
            j++;
        }
        // [i, j) is a prefix of a power of the Lyndon word of length j - k
        while (i <= k) { factors++; i += j - k; }
        if (factors > 1) return false;   // early exit, no need to finish
    }
    return factors == 1;
}`,
      explanation: [
        "Duval's algorithm maintains two pointers into the unprocessed suffix: j is the next character to look at, and k points at the character of the current candidate Lyndon prefix that j should be compared against. The distance j - k is the current period.",
        "While s[k] == s[j] the block simply repeats, so k advances in lockstep. On a strict rise s[k] < s[j] the whole scanned block plus the new character is still a single Lyndon word, so k is reset to i to start measuring the period again. On a drop s[k] > s[j] the current Lyndon word is closed: its length is exactly j - k, and the scanned region [i, j) is a whole number of copies of it followed by a proper prefix, so the copies are emitted and the leftover prefix is reprocessed.",
        "The tempting wrong test is 'the minimal rotation starts at index 0'. That is necessary but not sufficient: 'abab' has its minimal rotation at index 0 yet is not a Lyndon word, because Lyndon requires strict inequality and therefore aperiodicity. The single-factor test rules periodic strings out automatically.",
        "Comparing s against all n suffixes directly is O(n^2) in the worst case (think 'aaaa...ab'); Duval never backs j up, so the scan is linear.",
        "Time: O(n). Space: O(1) extra.",
      ],
    },
    {
      name: "Lyndon Factorization of a String (Duval's Algorithm)",
      difficulty: "Easy",
      variation: "Duval template, full factorization",
      link: "https://cp-algorithms.com/string/lyndon_factorization.html",
      question: [
        "The Chen-Fox-Lyndon theorem says every string has a unique factorization s = w1 w2 ... wm where each wi is a Lyndon word and w1 >= w2 >= ... >= wm in lexicographic order. Given a string s, return that factorization as a list of substrings, in order.",
        "Example 1:\nInput: s = 'banana'\nOutput: ['b', 'an', 'an', 'a']\nExplanation: Each factor is a Lyndon word, and 'b' > 'an' > 'a' ('an' beats 'a' because 'a' is a proper prefix of it), so the sequence is non-increasing.",
        "Example 2:\nInput: s = 'cbacba'\nOutput: ['c', 'b', 'acb', 'a']\nExplanation: 'c' > 'b' > 'acb' > 'a'. Note that a factor may be longer than the ones before it; only the lexicographic order has to be non-increasing, not the lengths.",
        "Constraints:\n- 1 <= s.length <= 10^6\n- s consists of characters from any ordered alphabet",
      ],
      code: `vector<string> duval(const string& s) {
    int n = s.size();
    int i = 0;
    vector<string> factors;
    while (i < n) {
        int j = i + 1, k = i;
        while (j < n && s[k] <= s[j]) {
            if (s[k] < s[j]) k = i;
            else k++;
            j++;
        }
        int len = j - k;   // length of the Lyndon word that closed here
        while (i <= k) {   // emit every full copy that fits in [i, j)
            factors.push_back(s.substr(i, len));
            i += len;
        }
    }
    return factors;
}`,
      explanation: [
        "The state is the triple (i, j, k): i is the start of the first factor not yet emitted, j the scan head, and k = j - period the position that j is compared with. The invariant after the inner loop is that s[i..j-1] equals a whole number of copies of the Lyndon word s[i..i+len-1] followed by a proper prefix of it, where len = j - k.",
        "That invariant is what makes the emit loop correct: while i <= k there is still a full copy left, so a factor of length len is cut off; when the loop stops, i sits on the leftover proper prefix, which is re-scanned from scratch. The proper prefix is never lost and never double-counted.",
        "Uniqueness of the factorization is what lets the algorithm be greedy and never revisit a decision. j only ever moves forward, and each emitted factor consumes characters permanently, so the total work is linear even though the inner loop can rescan the prefix region for a single factor.",
        "The classic bug is emitting only one factor per outer iteration. For 'aabaab' the scan reaches the end with len = 3, and both copies of 'aab' must be emitted before i advances past k; emitting one and continuing produces a wrong split.",
        "Time: O(n) - each character is scanned at most twice. Space: O(n) for the output, O(1) extra.",
      ],
    },
    {
      name: "Rotate String",
      difficulty: "Easy",
      variation: "Rotation equivalence via canonical cyclic form",
      link: "https://leetcode.com/problems/rotate-string/",
      question: [
        "You are given two strings s and goal. A shift on s moves its leftmost character to the rightmost position. Return true if s can be turned into goal after some number of shifts.",
        "Solve it with the canonical cyclic form: two strings are rotations of each other exactly when they have the same length and the same lexicographically minimal rotation, and Duval's algorithm computes that canonical form in linear time and constant extra space.",
        "Example 1:\nInput: s = 'abcde', goal = 'cdeab'\nOutput: true\nExplanation: Two shifts turn 'abcde' into 'cdeab'. Both strings have minimal rotation 'abcde'.",
        "Example 2:\nInput: s = 'abcde', goal = 'abced'\nOutput: false\nExplanation: The minimal rotation of 'abcde' is 'abcde' and the minimal rotation of 'abced' is 'abced', so the two canonical forms differ and no number of shifts can match them.",
        "Constraints:\n- 1 <= s.length, goal.length <= 100\n- s and goal consist of lowercase English letters",
      ],
      code: `string minRotation(const string& t) {
    string s = t + t;          // every rotation of t is a window of length n here
    int n = t.size(), i = 0, best = 0;
    while (i < n) {
        best = i;              // start of the smallest rotation seen so far
        int j = i + 1, k = i;
        while (j < (int)s.size() && s[k] <= s[j]) {
            if (s[k] < s[j]) k = i;
            else k++;
            j++;
        }
        while (i <= k) i += j - k;   // skip the whole scanned block at once
    }
    return s.substr(best, n);
}

bool rotateString(string s, string goal) {
    if (s.size() != goal.size()) return false;
    return minRotation(s) == minRotation(goal);
}`,
      explanation: [
        "Doubling the string turns 'rotations of t' into 'length-n windows of t+t', so the smallest rotation is the smallest such window. Running Duval over the doubled string and remembering the start of the last factor opened before position n gives exactly that window: the minimal rotation always begins at the start of some Lyndon factor of t+t, and the factor that covers index n - 1 or later is the winner.",
        "Why the skipping is safe: when a factor of length j - k closes, no position strictly inside the scanned block can start a smaller rotation, because such a position would start with a suffix of a Lyndon word, which is larger than the word itself. So the whole block is discarded in one jump.",
        "For this problem the standard trick is goal.size() == s.size() && (s + s).find(goal) != npos, which is simpler and fine at n <= 100. The canonical-form solution is the one that scales: it also answers 'group these 10^5 necklaces by rotation class', where pairwise substring searches would be quadratic.",
        "Do not forget the length check. Without it, comparing canonical forms of strings of different lengths is meaningless ('ab' and 'abab' both canonicalize to something starting with 'ab').",
        "Time: O(n) per string. Space: O(n) for the doubled copy.",
      ],
    },
    {
      name: "Minimal Rotation",
      difficulty: "Medium",
      variation: "Lexicographically smallest cyclic shift",
      link: "https://cses.fi/problemset/task/1110",
      question: [
        "A rotation of a string is produced by repeatedly moving its first character to the end. Given a string, print its lexicographically minimal rotation.",
        "Example 1:\nInput:\nbaabaa\nOutput:\naabaab\nExplanation: The six rotations are baabaa, aabaab, abaaba, baabaa, aabaab, abaaba. The smallest is aabaab, which starts at index 1 of the input.",
        "Example 2:\nInput:\nacab\nOutput:\nabac\nExplanation: The rotations are acab, caba, abac, baca; abac is the smallest.",
        "Constraints:\n- 1 <= string length <= 10^6\n- the string consists of lowercase English letters",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string t;
    cin >> t;
    int n = t.size();
    string s = t + t;
    int i = 0, best = 0;
    while (i < n) {
        best = i;
        int j = i + 1, k = i;
        while (j < 2 * n && s[k] <= s[j]) {
            if (s[k] < s[j]) k = i;
            else k++;
            j++;
        }
        while (i <= k) i += j - k;
    }
    cout << s.substr(best, n) << "\\n";
    return 0;
}`,
      explanation: [
        "This is Booth's problem solved with Duval instead of KMP failure links. The loop is plain Lyndon factorization of t + t, stopped as soon as the scan start i reaches n: every factor opened at an index below n is a candidate start, and the last such candidate is the answer.",
        "Correctness rests on one fact about Lyndon words: a Lyndon word is strictly smaller than all of its proper suffixes. Hence inside a closed factor no interior index can beat the factor's own start, which is why the inner scan can be thrown away in a single i += j - k jump and why only O(n) candidates are ever examined.",
        "Ties are handled for free. For a periodic string such as 'aaaa' the whole scan closes with period 1 and best stays at the earliest position, so the reported rotation is the smallest one and, if several rotations are equal, the earliest index producing it.",
        "The naive alternative - build all n rotations and take the min - is O(n^2) in time and memory and dies at n = 10^6. Sorting suffixes of t + t is O(n log n) and needs a suffix array; Duval is a 12-line linear scan with two integers of state.",
        "Time: O(n). Space: O(n) for the doubled string, O(1) extra.",
      ],
    },
    {
      name: "Glass Beads",
      difficulty: "Medium",
      variation: "Index of the smallest rotation, multiple queries",
      link: "https://www.spoj.com/problems/BEADS/",
      question: [
        "A necklace is a cyclic string of lowercase letters. The necklace can be cut between any two adjacent beads and then read off in the fixed direction, producing one rotation of the string. For each necklace, print the 1-based position of the bead that must come first so that the resulting string is lexicographically smallest. If several cut points give the same smallest string, print the smallest such position.",
        "The input starts with the number of test cases N, followed by N lines, each holding one necklace.",
        "Example 1:\nInput:\n4\nhelloworld\namandamanda\ndontcallmebfu\naaabaaa\nOutput:\n10\n11\n6\n5\nExplanation: For 'helloworld' the only 'd' sits at 1-based position 10, so starting there gives 'dhelloworl', the smallest rotation. For 'aaabaaa' starting at position 5 gives 'aaaaaab', which has six leading a's - more than any other cut point.",
        "Constraints:\n- 1 <= N <= 10\n- 1 <= necklace length <= 10^4\n- necklaces consist of lowercase English letters",
      ],
      code: `int leastRotationIndex(const string& t) {
    int n = t.size();
    string s = t + t;
    int i = 0, best = 0;
    while (i < n) {
        best = i;
        int j = i + 1, k = i;
        while (j < 2 * n && s[k] <= s[j]) {
            if (s[k] < s[j]) k = i;
            else k++;
            j++;
        }
        while (i <= k) i += j - k;
    }
    return best;   // 0-based start of the smallest rotation
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int tc;
    cin >> tc;
    while (tc--) {
        string s;
        cin >> s;
        cout << leastRotationIndex(s) + 1 << "\\n";   // problem wants 1-based
    }
    return 0;
}`,
      explanation: [
        "Same routine as the minimal-rotation problem, but the answer is the index rather than the string, so nothing is materialised: the doubled string is only read.",
        "The tie rule matters here. Because best is only updated when a new factor opens and the inner scan is skipped wholesale, a periodic necklace like 'abab' closes its first factor with period 2 and best remains 0, giving the earliest of the equal minimal cut points - exactly what the judge wants.",
        "This is the historic reason the problem is famous: it was the standard suffix-automaton or suffix-array exercise, and Duval collapses it to a linear scan with two pointers. With N up to 10 and length up to 10^4 even an O(n^2) comparison of all rotations would pass, but the same code handles 10^6 unchanged.",
        "A subtle trap in the O(n^2) approach is comparing rotations by building substrings inside the loop, which turns 10^4 into 10^8 character copies. Duval avoids the question entirely.",
        "Time: O(n) per necklace. Space: O(n).",
      ],
    },
    {
      name: "Lexicographically Largest Rotation of a String",
      difficulty: "Medium",
      variation: "Maximal cyclic shift, reversed comparator",
      question: [
        "Given a string s, return its lexicographically largest rotation, where a rotation moves some prefix of s to the back. Solve it in linear time and constant extra space.",
        "The trick is that Duval's algorithm only ever compares characters through one comparator. Flipping every comparison (use >= where the minimal version uses <=, and > where it uses <) factors the string over the reversed alphabet order, which turns the smallest-rotation routine into the largest-rotation routine.",
        "Example 1:\nInput: s = 'baca'\nOutput: 'caba'\nExplanation: The rotations are baca, acab, caba, abac. The largest is caba, starting at index 2.",
        "Example 2:\nInput: s = 'abcabc'\nOutput: 'cabcab'\nExplanation: The largest rotation starts at index 2. The string is periodic, so index 5 gives the same result; the routine reports the earliest such start.",
        "Constraints:\n- 1 <= s.length <= 10^6\n- s consists of lowercase English letters",
      ],
      code: `string maxRotation(const string& t) {
    int n = t.size();
    string s = t + t;
    int i = 0, best = 0;
    while (i < n) {
        best = i;
        int j = i + 1, k = i;
        while (j < 2 * n && s[k] >= s[j]) {   // comparator flipped
            if (s[k] > s[j]) k = i;           // strict drop restarts the period
            else k++;
            j++;
        }
        while (i <= k) i += j - k;
    }
    return s.substr(best, n);
}`,
      explanation: [
        "Nothing about Duval depends on the alphabet being ordered a < b < c; it only needs a total order. Reversing that order turns Lyndon words into 'anti-Lyndon' words (strictly greater than all proper suffixes) and turns the minimal cyclic shift into the maximal one. Two characters change in the code.",
        "The same invariant carries over: when a factor closes, every interior index starts with a proper suffix of an anti-Lyndon word, which is strictly smaller than the word itself, so no interior index can be the maximum start and the block can be skipped.",
        "The wrong-but-tempting shortcut is to negate the string ('z' - c) and reuse the minimal routine. That works for a plain alphabet but breaks as soon as the characters are arbitrary integers or tuples, where no complement exists. Passing the comparator instead is the version that generalises.",
        "A second trap is to look only at positions holding the maximum character. That finds the right candidate set but comparing those candidates pairwise is O(n^2) on inputs like 'zzzz...zy'.",
        "Time: O(n). Space: O(n) for the doubled copy, O(1) extra.",
      ],
    },
    {
      name: "Generating Lyndon Words in Lexicographic Order",
      difficulty: "Medium",
      variation: "Duval-Fredricksen-Kessler-Maiorana generation",
      link: "https://cp-algorithms.com/string/lyndon_factorization.html",
      question: [
        "Given n and k, generate every Lyndon word of length at most n over the alphabet {0, 1, ..., k-1}, in lexicographic order. The generator must use O(n) memory and produce each word in amortised constant time.",
        "The algorithm keeps the current word w as a vector of digits. Each step increments the last digit, reports the current w, extends it to length n by repeating it periodically, and then strips trailing (k-1) digits. The periodic extension is exactly the Duval invariant read backwards, which is why the words come out sorted.",
        "Example 1:\nInput: n = 3, k = 2\nOutput: 0, 001, 01, 011, 1\nExplanation: Those are all five binary Lyndon words of length <= 3: two of length 1, one of length 2 ('01'), and two of length 3 ('001' and '011'). '00', '11', '010' and '101' are excluded because they are periodic or start with a larger suffix.",
        "Example 2:\nInput: n = 2, k = 3\nOutput: 0, 01, 02, 1, 12, 2\nExplanation: Six words - the three single digits plus the three strictly increasing pairs. '10', '20' and '21' lose to their own suffixes, and '00', '11', '22' are periodic.",
        "Constraints:\n- 1 <= n <= 20\n- 1 <= k <= 10",
      ],
      code: `vector<string> generateLyndonWords(int n, int k) {
    vector<string> out;
    vector<int> w = {-1};   // sentinel: the first increment makes it digit 0
    while (!w.empty()) {
        w.back()++;
        int m = w.size();   // current word is w[0..m-1], a Lyndon word
        string cur;
        for (int d : w) cur += char('0' + d);
        out.push_back(cur);
        while ((int)w.size() < n) w.push_back(w[w.size() - m]);   // periodic extension
        while (!w.empty() && w.back() == k - 1) w.pop_back();     // strip maxed digits
    }
    return out;
}`,
      explanation: [
        "The state is one vector of at most n digits. The claim is that at the top of each iteration, after the increment, w[0..m-1] is the next Lyndon word in lexicographic order, and that the periodic extension of a Lyndon word to length n is the lexicographically largest string of length n whose Lyndon prefix is that word.",
        "That is why stripping trailing k-1 digits and incrementing gives the successor: the extended word is the last string of length n with this prefix, so the next Lyndon word must be obtained by increasing some digit, and the deepest digit that can still be increased is the first one from the right that is not already k-1.",
        "The periodic extension is where Duval reappears: repeating the word makes the string a power of a Lyndon word, and Duval's factorization of a power returns exactly that word, so the prefix relation the argument needs is guaranteed.",
        "The brute-force alternative - enumerate all k^n strings and test each for the Lyndon property - costs O(n k^n) and blows up long before n = 20. Generation is output-sensitive: the total work is proportional to the number of Lyndon words times their average length, and amortises to O(1) per word.",
        "Time: O(total output length), amortised O(1) per generated word. Space: O(n) plus the output.",
      ],
    },
    {
      name: "Last Substring in Lexicographical Order",
      difficulty: "Hard",
      variation: "Maximum suffix by two-pointer Duval scan",
      link: "https://leetcode.com/problems/last-substring-in-lexicographical-order/",
      question: [
        "Given a string s, return the lexicographically largest substring of s. Since any substring is a prefix of some suffix, and extending a string can only make it larger, the answer is always the lexicographically largest suffix of s.",
        "Example 1:\nInput: s = 'abab'\nOutput: 'bab'\nExplanation: The suffixes are 'abab', 'bab', 'ab', 'b'; the largest is 'bab' because 'b' ties with 'b' and then 'a' beats the end of string.",
        "Example 2:\nInput: s = 'leetcode'\nOutput: 'tcode'\nExplanation: 't' is the largest character and appears once, so the suffix starting at it wins.",
        "Constraints:\n- 1 <= s.length <= 4 * 10^5\n- s consists of lowercase English letters",
      ],
      code: `string lastSubstring(string s) {
    int n = s.size();
    int i = 0, j = 1, k = 0;   // i = best candidate, j = challenger, k = matched length
    while (j + k < n) {
        if (s[i + k] == s[j + k]) { k++; continue; }
        if (s[i + k] > s[j + k]) {
            j = j + k + 1;         // challenger loses; every start inside it also loses
        } else {
            i = max(i + k + 1, j); // champion loses; skip the whole matched block
            j = i + 1;
        }
        k = 0;
    }
    return s.substr(i);
}`,
      explanation: [
        "This is the maximum-suffix problem, the mirror image of the minimal-rotation scan. Two candidate starts i and j are compared character by character; k is the length of their common prefix so far.",
        "When the challenger j loses at offset k, no start in (j, j + k] can win either: such a start begins with a proper suffix of the block s[j..j+k], which is a proper suffix of the same block starting at i, and the champion already beat it there. So j jumps past the whole block. Symmetrically, when the champion loses, all of i..i+k are eliminated, and the new champion is max(i + k + 1, j) because positions before j have all been discarded already.",
        "That max is the line everyone gets wrong. Writing i = j (or i = i + k + 1) alone can move the champion backwards into already-eliminated territory or skip past the only surviving candidate, and the bug only shows on periodic inputs such as 'cacacb'.",
        "Each iteration either advances j or advances i past positions that can never be revisited, and k restarts from 0 only after a mismatch, so the total number of character comparisons is O(n).",
        "The tempting O(n^2) approach compares all n suffixes with substr, which is quadratic in time and allocation; a suffix array solves it in O(n log n) but is far more code than these ten lines.",
        "Time: O(n). Space: O(1) extra beyond the returned substring.",
      ],
    },
    {
      name: "Orderly Queue",
      difficulty: "Hard",
      variation: "Minimal rotation as the k = 1 case",
      link: "https://leetcode.com/problems/orderly-queue/",
      question: [
        "You are given a string s and an integer k. In one move you choose one of the first k characters of s and move it to the end of the string. Return the lexicographically smallest string obtainable after any number of moves.",
        "Example 1:\nInput: s = 'cba', k = 1\nOutput: 'acb'\nExplanation: With k = 1 only the leading character can move, so the reachable strings are exactly the rotations: cba, bac, acb. The smallest is acb.",
        "Example 2:\nInput: s = 'baaca', k = 3\nOutput: 'aaabc'\nExplanation: With k >= 2 any permutation is reachable, so the answer is the sorted string.",
        "Constraints:\n- 1 <= k <= s.length <= 1000\n- s consists of lowercase English letters",
      ],
      code: `string minRotation(const string& t) {
    int n = t.size();
    string s = t + t;
    int i = 0, best = 0;
    while (i < n) {
        best = i;
        int j = i + 1, k = i;
        while (j < 2 * n && s[k] <= s[j]) {
            if (s[k] < s[j]) k = i;
            else k++;
            j++;
        }
        while (i <= k) i += j - k;
    }
    return s.substr(best, n);
}

string orderlyQueue(string s, int k) {
    if (k >= 2) {                       // any permutation is reachable
        sort(s.begin(), s.end());
        return s;
    }
    return minRotation(s);              // k == 1: only rotations are reachable
}`,
      explanation: [
        "The whole problem is a case split. With k = 1 the single legal move is 'first character to the back', which is precisely a rotation, so the reachable set is the n rotations and the answer is the minimal one - Duval's canonical cyclic form.",
        "With k >= 2 the reachable set is every permutation, so the answer is the sorted string. The reason is that moving the second character while leaving the first alone performs an adjacent swap on the pair, up to a rotation of the whole string; since rotations are also free when k >= 2, and adjacent swaps plus rotations generate the full symmetric group, any arrangement can be built. Sorting is therefore both achievable and optimal.",
        "The trap is trying to be clever in the k >= 2 branch, for example greedily pulling the smallest character forward and hoping the rest falls out - it does not, and the simple sort is provably optimal. The second trap is treating k = 1 as 'move the smallest character to the front', which ignores that the rest of the string must stay in cyclic order.",
        "At n <= 1000 the k = 1 branch could brute force all n rotations in O(n^2), but Duval makes it linear and is the same routine already used for minimal rotation.",
        "Time: O(n log n) for k >= 2, O(n) for k = 1. Space: O(n).",
      ],
    },
    {
      name: "Cracking the Safe",
      difficulty: "Hard",
      variation: "De Bruijn sequence from concatenated Lyndon words",
      link: "https://leetcode.com/problems/cracking-the-safe/",
      question: [
        "A safe is opened by a password of n digits, where each digit is in the range 0 to k-1. The keypad remembers only the last n digits entered, so a single long string of digits tries every window of length n it contains. Return any shortest string that is guaranteed to open the safe, that is, a string containing every one of the k^n possible passwords as a contiguous substring.",
        "The optimal length is k^n + n - 1, and the classic construction is the Fredricksen-Kessler-Maiorana theorem: concatenating, in lexicographic order, all Lyndon words over the alphabet whose length divides n yields a de Bruijn sequence of length exactly k^n. Appending the first n-1 characters unwraps that cyclic sequence into a linear one.",
        "Example 1:\nInput: n = 2, k = 2\nOutput: '00110'\nExplanation: The Lyndon words over {0,1} whose length divides 2 are '0', '01' and '1', giving the cyclic sequence '0011'; appending the first character yields '00110', whose length-2 windows are 00, 01, 11, 10 - all four passwords.",
        "Example 2:\nInput: n = 3, k = 2\nOutput: '0001011100'\nExplanation: The relevant Lyndon words are '0', '001', '011', '1' (length 2 does not divide 3), so the cyclic sequence is '00010111'; appending '00' gives a string of length 8 + 2 = 10 that contains all eight 3-bit passwords.",
        "Constraints:\n- 1 <= n <= 4\n- 1 <= k <= 10",
      ],
      code: `string crackSafe(int n, int k) {
    string seq;
    vector<int> w = {-1};   // sentinel so the first increment yields digit 0
    while (!w.empty()) {
        w.back()++;
        int m = w.size();
        if (n % m == 0)                      // keep only lengths dividing n
            for (int d : w) seq += char('0' + d);
        while ((int)w.size() < n) w.push_back(w[w.size() - m]);
        while (!w.empty() && w.back() == k - 1) w.pop_back();
    }
    string res = seq;
    // unwrap the cyclic sequence; indexing seq modulo its length keeps k = 1 safe
    for (int t = 0; t + 1 < n; t++) res += seq[t % seq.size()];
    return res;
}`,
      explanation: [
        "The generator is the Duval-based Lyndon word enumerator: increment the last digit, extend periodically to length n, strip trailing k-1 digits. Filtering the emitted words to those whose length divides n and concatenating them in the order produced gives a de Bruijn sequence B(k, n) - this is the FKM theorem, and the lexicographic order of the words is what makes it come out right.",
        "The length is automatically optimal. The number of Lyndon words of length d, summed over divisors d of n with multiplicity d, is exactly k^n by the necklace-counting identity, so the cyclic sequence has length k^n and the unwrapped string has length k^n + n - 1 - the information-theoretic minimum, since a string of length L exposes only L - n + 1 windows.",
        "The usual solution here is an Eulerian circuit (Hierholzer) on the graph of (n-1)-digit states, or a greedy DFS over visited nodes. Both are correct but need O(k^n) memory for the visited set and recursion; the Lyndon construction writes the answer directly with O(n) working memory and no graph at all.",
        "The edge case that breaks naive code is k = 1, where the only Lyndon word is '0' and seq has length 1 while n - 1 characters must still be appended. Indexing seq[t % seq.size()] handles it; res.substr(0, n - 1) would read out of range.",
        "Time: O(k^n) - proportional to the output. Space: O(k^n) for the output, O(n) working memory.",
      ],
    },
  ],
};
