import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Sum over Subsets (SOS DP)",
      difficulty: "Easy",
      variation: "Subset zeta transform, the template",
      question: [
        "You are given an integer n and an array f of length 2^n, indexed by bitmasks over n elements. Compute the array F where F[mask] is the sum of f[sub] over every sub that is a submask of mask (that is, every sub with sub AND mask == sub, including 0 and mask itself). Return F.",
        "The naive method iterates the submasks of every mask, which costs 3^n. The goal is O(2^n * n).",
        "Example 1:\nInput: n = 2, f = [1, 2, 3, 4]\nOutput: [1, 3, 4, 10]\nExplanation: F[00] = f[00] = 1. F[01] = f[00] + f[01] = 3. F[10] = f[00] + f[10] = 4. F[11] = 1 + 2 + 3 + 4 = 10.",
        "Example 2:\nInput: n = 3, f = [1, 1, 1, 1, 1, 1, 1, 1]\nOutput: [1, 2, 2, 4, 2, 4, 4, 8]\nExplanation: with f all ones, F[mask] just counts the submasks of mask, which is 2^popcount(mask).",
        "Constraints:\n- 1 <= n <= 20\n- the sums fit in a signed 64-bit integer",
      ],
      code: `vector<long long> sumOverSubsets(int n, vector<long long> f) {
    for (int i = 0; i < n; i++)                       // one layer per bit
        for (int mask = 0; mask < (1 << n); mask++)
            if (mask >> i & 1)                       // only masks that own bit i pull anything in
                f[mask] += f[mask ^ (1 << i)];       // absorb the half of the sum that lacks bit i
    return f;
}`,
      explanation: [
        "The transform is done in n layers. Think of the intermediate value after layer i as S(i, mask) = sum of f[sub] over all sub that agree with mask on bits i+1..n-1 and are free to be anything (still submask) on bits 0..i. Layer i then splits the submasks of mask into those without bit i (already summed in S(i-1, mask xor bit)) and those with it (S(i-1, mask)), so adding the two is exactly the definition of S(i, mask).",
        "After the last layer every low bit has been freed, so S(n-1, mask) is the sum over all submasks of mask. The loop order matters only in that the bit loop must be outside: within one layer each mask reads a mask that this layer never writes, so the update is safe in place.",
        "The tempting wrong version is a single loop that enumerates submasks with sub = (sub - 1) AND mask. It is correct but costs 3^n, which at n = 20 is 3.5 * 10^9 against 2 * 10^7 for SOS. The other classic bug is putting the mask loop outside and the bit loop inside, which double counts because a mask can then absorb a value that already includes bit i.",
        "The mirror transform, summing over supersets, is the same code with the condition flipped: if the mask does not own bit i, add f[mask OR bit]. Almost every real SOS problem needs one of these two directions plus a complement trick.",
        "Time: O(2^n * n). Space: O(2^n), and O(1) extra since the transform runs in place.",
      ],
    },
    {
      name: "Bit Problem",
      difficulty: "Medium",
      variation: "Submask, superset and intersecting counts at once",
      link: "https://cses.fi/problemset/task/1654",
      question: [
        "You are given a list of n integers x[1..n], each below 2^20. For every x[i] print three counts: the number of indices j such that x[j] is a submask of x[i] (x[j] AND x[i] == x[j]), the number of indices j such that x[j] is a supermask of x[i] (x[j] AND x[i] == x[i]), and the number of indices j such that x[j] AND x[i] is not zero. Every count includes j = i itself when it qualifies.",
        "Example 1:\nInput:\n3\n5 3 1\nOutput:\n2 1 3\n2 1 3\n1 3 3\nExplanation: 5 = 101, 3 = 011, 1 = 001. Submasks of 101 in the list are 101 and 001, so 2; the only supermask of 101 is itself; all three values share a bit with 101. For 001 the only submask is itself, while all three values contain bit 0, so 3 supermasks and 3 intersections.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 0 <= x[i] < 2^20",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const int B = 20, N = 1 << B;
    int n;
    cin >> n;
    vector<int> x(n);
    vector<int> sub(N, 0);
    for (int i = 0; i < n; i++) { cin >> x[i]; sub[x[i]]++; }
    vector<int> sup = sub;                       // both transforms start from the same histogram
    for (int i = 0; i < B; i++)
        for (int m = 0; m < N; m++) {
            if (m >> i & 1) sub[m] += sub[m ^ (1 << i)];   // subset zeta transform
            else            sup[m] += sup[m | (1 << i)];   // superset zeta transform
        }
    for (int i = 0; i < n; i++) {
        int comp = (N - 1) ^ x[i];               // the bits x[i] does not own
        cout << sub[x[i]] << " " << sup[x[i]] << " " << n - sub[comp] << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Start from the histogram cnt[v] = how many array entries equal v. Then the first answer is the subset sum of cnt at x[i] and the second is the superset sum of cnt at x[i]. Both are one zeta transform over 2^20 masks, so all n queries are answered by two precomputations rather than n scans.",
        "The third count is the one people over-engineer. Complement it: the values that do NOT intersect x[i] are exactly the values whose bits all lie outside x[i], that is the submasks of the complement of x[i]. So the answer is n - sub[complement]. No third transform is needed.",
        "Both transforms can share the same mask loop because they live in separate arrays and, within layer i, a mask only ever reads a partner that layer i does not write: the subset pass reads masks without bit i, the superset pass reads masks with bit i.",
        "Note the complement must be taken over exactly the 20 declared bits, not over the full 32-bit word, or you index outside the table.",
        "Time: O(2^B * B + n) with B = 20, about 2 * 10^7 operations. Space: O(2^B).",
      ],
    },
    {
      name: "Compatible Numbers",
      difficulty: "Medium",
      variation: "Existence over submasks (carry a witness, not a sum)",
      link: "https://codeforces.com/problemset/problem/165/E",
      question: [
        "Two integers are called compatible if their bitwise AND is zero. Given an array a of n integers, print for each a[i] any element a[j] of the array that is compatible with it, or -1 if no element of the array is compatible with a[i]. The index j may equal i only if a[i] AND a[i] == 0, that is only if a[i] is zero.",
        "Example 1:\nInput:\n3\n1 2 3\nOutput: 2 1 -1\nExplanation: 1 AND 2 = 0, so 1 and 2 answer each other. 3 = 11 shares a bit with every element of the array, so it has no partner.",
        "Example 2:\nInput:\n2\n90 36\nOutput: 36 90\nExplanation: 90 = 1011010 and 36 = 0100100 have no bit in common, so their AND is zero.",
        "Constraints:\n- 1 <= n <= 10^6\n- 1 <= a[i] <= 4 * 10^6, so 22 bits suffice",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const int B = 22, N = 1 << B;                // 4 * 10^6 < 2^22
    int n;
    cin >> n;
    vector<int> a(n);
    vector<int> dp(N, -1);                       // dp[mask] = some array value that is a submask of mask
    for (int i = 0; i < n; i++) { cin >> a[i]; dp[a[i]] = a[i]; }
    for (int i = 0; i < B; i++)
        for (int m = 0; m < N; m++)
            if ((m >> i & 1) && dp[m] == -1)
                dp[m] = dp[m ^ (1 << i)];        // inherit any witness found without bit i
    for (int i = 0; i < n; i++)
        cout << dp[(N - 1) ^ a[i]] << " \\n"[i == n - 1];
    return 0;
}`,
      explanation: [
        "Rewrite the condition: a[j] AND a[i] == 0 means every bit of a[j] lies outside a[i], that is a[j] is a submask of the complement of a[i]. So the query is 'does the array contain any submask of this mask, and which one'.",
        "That is a sum over subsets where the aggregate is not addition but 'pick any witness'. Seed dp at the masks that actually occur in the array and run the same n-layer subset transform, keeping the first witness found. Since the aggregate is idempotent, keeping one representative is enough and no double counting can happen.",
        "The trap is trying to answer each query by enumerating the submasks of the complement: with 22 bits and 10^6 queries that is hopeless, while the single transform costs 22 * 2^22 which is about 9 * 10^7.",
        "Because the answer is a value and not an index, duplicates in the array need no special handling; and if some a[i] is zero the complement is the full mask, whose witness is guaranteed to exist.",
        "Time: O(2^B * B + n). Space: O(2^B).",
      ],
    },
    {
      name: "Number of Valid Words for Each Puzzle",
      difficulty: "Hard",
      variation: "Submask enumeration when 2^n is too large",
      link: "https://leetcode.com/problems/number-of-valid-words-for-each-puzzle/",
      question: [
        "You are given an array words of lowercase strings and an array puzzles of lowercase strings, where every puzzle has exactly 7 distinct letters. A word is valid for a puzzle if the word contains the first letter of the puzzle and every letter of the word appears somewhere in the puzzle. Return an array answer where answer[i] is the number of words valid for puzzles[i].",
        "Example 1:\nInput: words = ['aaaa','asas','able','ability','actt','actor','access'], puzzles = ['aboveyz','abrodyz','abslute','absoryz','actresz','gaswxyz']\nOutput: [1,1,3,2,4,0]\nExplanation: for 'abslute' the valid words are 'aaaa', 'asas' and 'able'; for 'actresz' they are 'aaaa', 'asas', 'actt' and 'access'; no word contains a 'g', so 'gaswxyz' scores 0.",
        "Example 2:\nInput: words = ['apple','pleas','please'], puzzles = ['aelwxyz','aelpxyz','aelpsxy','saelpxy','xaelpsy']\nOutput: [0,1,3,2,0]\nExplanation: 'aelpsxy' admits all three words; 'saelpxy' has first letter 's', so 'apple' is out; 'xaelpsy' has first letter 'x', which no word contains.",
        "Constraints:\n- 1 <= words.length <= 10^5\n- 4 <= words[i].length <= 50\n- 1 <= puzzles.length <= 10^4\n- puzzles[i].length == 7 with all letters distinct",
      ],
      code: `vector<int> findNumOfValidWords(vector<string>& words, vector<string>& puzzles) {
    unordered_map<int,int> cnt;
    for (auto& w : words) {
        int m = 0;
        for (char c : w) m |= 1 << (c - 'a');
        if (__builtin_popcount(m) <= 7) cnt[m]++;   // a wider letter set can never fit a 7-letter puzzle
    }
    vector<int> res;
    for (auto& p : puzzles) {
        int full = 0;
        for (char c : p) full |= 1 << (c - 'a');
        int first = 1 << (p[0] - 'a');
        int rest = full ^ first;
        int total = 0;
        for (int sub = rest; ; sub = (sub - 1) & rest) {   // walk every submask of rest, high to low
            auto it = cnt.find(sub | first);              // the first letter is mandatory
            if (it != cnt.end()) total += it->second;
            if (sub == 0) break;                          // 0 is a valid submask, so exit after it
        }
        res.push_back(total);
    }
    return res;
}`,
      explanation: [
        "Only the letter set of a word matters, so collapse each word to a 26-bit mask and count masks. A word is valid for a puzzle exactly when its mask is a submask of the puzzle mask and contains the puzzle's first-letter bit.",
        "This is the sum-over-subsets question, but the universe has 26 bits: a full SOS table would be 2^26 masks times 26 layers, about 1.7 * 10^9 updates and 268 MB. The right move here is the opposite trade: the queries are few (10^4) and each puzzle mask is sparse (7 bits), so enumerate the 2^6 = 64 submasks of the six optional letters instead. Knowing when NOT to run the transform is part of knowing the pattern.",
        "The submask walk sub = (sub - 1) AND rest is the standard idiom: subtracting one borrows through the low zero bits and the AND clears whatever is not in rest, so it lands on the next smaller submask. It never emits 0 as a successor, which is why the loop breaks after processing 0 rather than testing at the top.",
        "Words with more than 7 distinct letters can be dropped up front, and the hash map keyed by mask collapses the up to 10^5 words into at most a few thousand distinct masks, so the per-puzzle cost is 64 lookups.",
        "Time: O(sum of word lengths + puzzles.length * 2^6). Space: O(number of distinct word masks).",
      ],
    },
    {
      name: "Yet Another Substring Reverse",
      difficulty: "Hard",
      variation: "Max over submasks, then pair a mask with its complement",
      link: "https://codeforces.com/problemset/problem/1234/F",
      question: [
        "You are given a string s made of the first 20 lowercase letters. You may reverse at most one substring of s (possibly none). After that, print the maximum possible length of a substring of s that contains only distinct characters.",
        "Example 1:\nInput:\nabcdecdf\nOutput: 6\nExplanation: reversing the suffix 'f' next to 'abcde' is not needed as a reversal of that exact form, but reversing the block 'cdf' brings 'f' adjacent to 'abcde', giving the distinct-letter block 'abcdef' of length 6.",
        "Example 2:\nInput:\nabacaba\nOutput: 3\nExplanation: the letter sets available from contiguous distinct-letter blocks are {a}, {b}, {c}, {a,b}, {b,a}, {a,c}, {c,a}; the best disjoint pair is {a,b} with {c}, so 3.",
        "Constraints:\n- 1 <= |s| <= 10^6\n- s contains only the letters a..t (the first 20 letters)",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    const int B = 20, N = 1 << B;
    int n = s.size();
    vector<int> f(N, 0);
    for (int i = 0; i < n; i++) {              // mark every distinct-letter substring's mask
        int mask = 0;
        for (int j = i; j < n && j < i + B; j++) {
            int b = 1 << (s[j] - 'a');
            if (mask & b) break;               // a repeat ends this run
            mask |= b;
            f[mask] = __builtin_popcount(mask);
        }
    }
    for (int i = 0; i < B; i++)                // SOS with max: f[mask] = best achievable submask
        for (int m = 0; m < N; m++)
            if (m >> i & 1) f[m] = max(f[m], f[m ^ (1 << i)]);
    int ans = 0;
    for (int m = 0; m < N; m++) ans = max(ans, f[m] + f[(N - 1) ^ m]);
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "The key reduction: one reversal lets you glue any two disjoint substrings together, and nothing more. So the answer is the largest total size of two distinct-letter substrings whose letter sets are disjoint (one of them may be empty). Proving the upper bound is the interesting half: after a single reversal any window is the concatenation of at most two pieces of the original string.",
        "Mark f[mask] = popcount(mask) for every mask that is realised by some distinct-letter substring. A distinct-letter run has at most 20 characters, so scanning from every start position costs only 20n.",
        "Now run the subset transform with max instead of plus: f[mask] becomes the largest achievable submask of mask. That step is what lets the final loop simply take f[mask] + f[complement of mask] - the two halves are automatically disjoint and each is realised by a real substring.",
        "Skipping the transform and pairing only exactly-realised masks is the tempting error; it misses cases where the best partner is a smaller piece of a bigger realised block, since the answer's two halves need not both be maximal runs.",
        "Time: O(20n + 2^20 * 20). Space: O(2^20).",
      ],
    },
    {
      name: "Jzzhu and Numbers",
      difficulty: "Hard",
      variation: "Superset counts plus inclusion-exclusion",
      link: "https://codeforces.com/problemset/problem/449/D",
      question: [
        "You are given n non-negative integers a[1..n]. Count the number of non-empty subsets of indices whose bitwise AND is zero. Two subsets are different if their index sets differ, even when the values coincide. Print the count modulo 10^9 + 7.",
        "Example 1:\nInput:\n3\n2 3 3\nOutput: 0\nExplanation: every value has bit 1 set, so every AND keeps bit 1 and can never be zero.",
        "Example 2:\nInput:\n4\n0 1 2 3\nOutput: 10\nExplanation: the 8 subsets containing the value 0 all have AND zero, and among the subsets of {1,2,3} only {1,2} and {1,2,3} do, for 8 + 2 = 10.",
        "Constraints:\n- 1 <= n <= 10^6\n- 0 <= a[i] <= 10^6, so 20 bits suffice",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const long long MOD = 1000000007;
    const int B = 20, N = 1 << B;
    int n;
    cin >> n;
    vector<int> cnt(N, 0);
    for (int i = 0; i < n; i++) { int a; cin >> a; cnt[a]++; }
    for (int i = 0; i < B; i++)                       // superset transform:
        for (int m = 0; m < N; m++)                   // cnt[m] = how many a[i] contain all bits of m
            if (!(m >> i & 1)) cnt[m] += cnt[m | (1 << i)];
    vector<long long> pw(n + 1);
    pw[0] = 1;
    for (int i = 1; i <= n; i++) pw[i] = pw[i - 1] * 2 % MOD;
    long long ans = 0;
    for (int m = 0; m < N; m++) {
        long long term = pw[cnt[m]] - 1;              // non-empty subsets whose AND contains m
        if (__builtin_popcount(m) & 1) ans -= term; else ans += term;
        ans %= MOD;
    }
    cout << (ans % MOD + MOD) % MOD << "\\n";
    return 0;
}`,
      explanation: [
        "Let g(m) be the number of non-empty subsets whose AND is a supermask of m. A subset's AND contains bit b exactly when every chosen element contains bit b, so the subsets counted by g(m) are precisely the non-empty subsets of the elements that are supermasks of m: g(m) = 2^cnt[m] - 1, where cnt[m] counts elements containing all bits of m.",
        "cnt is the superset zeta transform of the value histogram: one pass of 20 layers gives all 2^20 values. Building it by enumerating supermasks per element would be 3^20.",
        "Now inclusion-exclusion over the bits that must be absent: the number of subsets whose AND is exactly zero is the alternating sum over m of (-1)^popcount(m) * g(m). Every subset whose AND equals some mask A is counted once for each submask m of A with sign (-1)^popcount(m), and that alternating sum over the submasks of A is zero unless A = 0, where it is 1.",
        "Two arithmetic traps: exponents reach 10^6 so precompute powers of two modulo the prime rather than calling fast exponentiation 10^6 times inside the loop, and keep the running sum non-negative at the end since half the terms are subtracted.",
        "Time: O(2^B * B + n). Space: O(2^B).",
      ],
    },
    {
      name: "Vowels",
      difficulty: "Hard",
      variation: "Answering all 2^n queries at once through complements",
      link: "https://codeforces.com/problemset/problem/383/E",
      question: [
        "There are n words, each exactly 3 letters long, using only the first 24 lowercase letters a..x. A set of letters may be declared the vowels. Given a vowel set S, a word is correct if it contains at least one letter of S. Let f(S) be the number of correct words for the vowel set S. Consider all 2^24 possible vowel sets and print the bitwise XOR of f(S)^2 over all of them.",
        "Example 1:\nInput:\n5\nabc\naaa\nada\nbcd\ndef\nOutput: 0\nExplanation: some letter, say 'x', appears in no word, so f(S) = f(S with x added) for every S. That pairs all 2^24 vowel sets into equal-valued couples, and every square cancels in the XOR.",
        "Example 2:\nInput:\n8\nabc\ndef\nghi\njkl\nmno\npqr\nstu\nvwx\nOutput: 64\nExplanation: the eight words tile all 24 letters, so no cancelling letter exists and the XOR of the 2^24 squares survives as 64.",
        "Constraints:\n- 1 <= n <= 10^4\n- every word has exactly 3 characters from a..x",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const int B = 24, N = 1 << B;
    int n;
    cin >> n;
    vector<int> g(N, 0);
    for (int i = 0; i < n; i++) {
        string w;
        cin >> w;
        int mask = 0;
        for (char c : w) mask |= 1 << (c - 'a');   // at most 3 bits, duplicates collapse
        g[mask]++;
    }
    for (int i = 0; i < B; i++)                    // g[T] = words whose letter set is a submask of T
        for (int m = 0; m < N; m++)
            if (m >> i & 1) g[m] += g[m ^ (1 << i)];
    long long ans = 0;
    for (int m = 0; m < N; m++) {
        long long f = n - g[m];                    // m plays the role of the complement of S
        ans ^= f * f;
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Complement the condition. A word is wrong for the vowel set S exactly when none of its letters is in S, that is when its letter set is a submask of the complement of S. So f(S) = n - g(complement of S), where g(T) counts words whose letter set is a submask of T.",
        "g is one subset zeta transform of the histogram of word masks. That single 24-layer pass answers all 2^24 vowel sets, which is the entire point: any per-query scan over n words would cost 1.6 * 10^11.",
        "Because complementation is a bijection on masks, the final loop can iterate m over all masks and treat m as the complement of S directly, XOR-ing (n - g[m])^2. There is no need to compute the complement explicitly.",
        "Only the set of letters in a word matters, so 'aaa' collapses to a single bit and duplicate words simply add to the same histogram slot. Use a 64-bit accumulator: f can reach 10^4, so f^2 reaches 10^8, which is fine in 32 bits, but the XOR of squares is clearer kept wide.",
        "Time: O(2^B * B + n) with B = 24, about 4 * 10^8 very cheap operations. Space: O(2^B) ints, 64 MB, which is the real constraint here.",
      ],
    },
    {
      name: "Bits And Pieces",
      difficulty: "Hard",
      variation: "SOS carrying witnesses, plus a greedy bit-by-bit build",
      link: "https://codeforces.com/problemset/problem/1208/F",
      question: [
        "You are given an array a of n integers. Find the maximum value of a[i] OR (a[j] AND a[k]) over all triples of indices with i < j < k.",
        "Example 1:\nInput:\n3\n2 4 6\nOutput: 6\nExplanation: the only triple gives 2 OR (4 AND 6) = 2 OR 4 = 6.",
        "Example 2:\nInput:\n4\n2 8 4 7\nOutput: 12\nExplanation: taking i = 2, j = 3, k = 4 gives 8 OR (4 AND 7) = 8 OR 4 = 12, which beats every other triple.",
        "Constraints:\n- 3 <= n <= 10^6\n- 0 <= a[i] < 2^21",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const int B = 21, N = 1 << B;
    int n;
    cin >> n;
    vector<int> a(n);
    vector<array<int,2>> best(N, {-1, -1});   // two largest indices whose value contains this mask
    for (int i = 0; i < n; i++) {
        cin >> a[i];
        auto &b = best[a[i]];
        if (i > b[0]) { b[1] = b[0]; b[0] = i; } else if (i > b[1]) b[1] = i;
    }
    auto merge2 = [](array<int,2> &dst, const array<int,2> &src) {
        for (int v : src) {
            if (v < 0) continue;
            if (v > dst[0]) { dst[1] = dst[0]; dst[0] = v; }
            else if (v > dst[1]) dst[1] = v;
        }
    };
    for (int i = 0; i < B; i++)                // superset transform of the top-two witnesses
        for (int m = 0; m < N; m++)
            if (!(m >> i & 1)) merge2(best[m], best[m | (1 << i)]);
    int ans = 0;
    for (int i = 0; i + 2 < n; i++) {
        int cur = 0;                           // bits we still need from the AND of the pair
        for (int bit = B - 1; bit >= 0; bit--) {
            if (a[i] >> bit & 1) continue;     // already free from a[i], do not spend the pair on it
            int cand = cur | (1 << bit);
            if (best[cand][1] > i) cur = cand; // two indices after i both contain every bit of cand
        }
        ans = max(ans, a[i] | cur);
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Fix i and ask which masks are achievable as a submask of a[j] AND a[k] for some i < j < k. A mask m is achievable iff at least two indices greater than i have values that are supermasks of m. So precompute, for every mask, the two largest indices whose value contains that mask - a superset transform where the aggregate is 'keep the top two witnesses' rather than a sum.",
        "The aggregate must keep two, not one: with a single witness you cannot tell 'one index is available' from 'two are'. Keeping the two largest is exactly the right summary because the feasibility test for a given i is monotone in the index - if the second largest witness exceeds i, then two valid indices exist.",
        "With that table the answer for a fixed i is a greedy from the high bit down. Bits already present in a[i] are free and must not be demanded of the pair, since demanding them only shrinks the set of usable pairs. For every other bit, tentatively add it to the required mask and keep it if two witnesses after i remain. Greedy is valid because one high bit outweighs every lower bit combined.",
        "The trap is looping over pairs (j, k) or rebuilding the table per i; both are quadratic at best. The whole point is that the table is built once and each i then costs 21 lookups.",
        "Time: O(2^B * B + n * B). Space: O(2^B) pairs of ints, which is the tight resource at B = 21.",
      ],
    },
    {
      name: "Love-Hate",
      difficulty: "Hard",
      variation: "Randomised restriction to 15 bits, then superset SOS",
      question: [
        "A shop sells m kinds of drink. There are n friends, and each friend likes exactly p of the kinds, given as a binary string of length m where a one means the friend likes that kind. Choose a set of kinds to buy so that at least ceil(n / 2) friends like every kind you chose. Return the maximum possible number of chosen kinds.",
        "The judge version also asks you to print the chosen set as a binary string of length m; the solution below returns its size, and remembering the winning mask recovers the set.",
        "Example 1:\nInput: n = 4, m = 5, p = 3, like = ['11100','11010','10110','11001']\nOutput: 2\nExplanation: at least 2 friends must like every chosen kind. Kinds {1,2} are liked by friends 1, 2 and 4, so size 2 works. No set of size 3 is liked by two friends: {1,2,3} only by friend 1, {1,2,4} only by friend 2, {1,2,5} only by friend 4.",
        "Example 2:\nInput: n = 3, m = 4, p = 2, like = ['1100','1100','0011']\nOutput: 2\nExplanation: ceil(3/2) = 2 friends are needed, and kinds {1,2} are liked by both friend 1 and friend 2.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 1 <= p <= m <= 60\n- p <= 15",
      ],
      code: `int maxLikedSet(int n, int m, int p, vector<string>& like) {
    vector<long long> f(n, 0);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++)
            if (like[i][j] == '1') f[i] |= 1LL << j;   // m can be 60, so 64-bit masks
    const int need = (n + 1) / 2;                      // ceil(n / 2)
    mt19937 rng(998244353);
    int ans = 0;
    vector<int> cnt(1 << p);
    for (int iter = 0; iter < 40; iter++) {            // failure probability at most 2^-40
        int r = rng() % n;
        vector<int> items;                             // the at most 15 kinds this friend likes
        for (int j = 0; j < m; j++) if (f[r] >> j & 1) items.push_back(j);
        int q = items.size(), Q = 1 << q;
        fill(cnt.begin(), cnt.begin() + Q, 0);
        for (int i = 0; i < n; i++) {                  // compress every friend to q bits
            int sub = 0;
            for (int b = 0; b < q; b++) if (f[i] >> items[b] & 1) sub |= 1 << b;
            cnt[sub]++;
        }
        for (int b = 0; b < q; b++)                    // superset SOS over the compressed universe
            for (int mask = 0; mask < Q; mask++)
                if (!(mask >> b & 1)) cnt[mask] += cnt[mask | (1 << b)];
        for (int mask = 0; mask < Q; mask++)           // cnt[mask] = friends who like all of mask
            if (cnt[mask] >= need) ans = max(ans, __builtin_popcount(mask));
    }
    return ans;
}`,
      explanation: [
        "The obstacle is m up to 60, so the candidate sets cannot be enumerated. The unlock is that any valid answer set is liked by at least half the friends, so a uniformly random friend likes every kind in the optimal set with probability at least one half. Conditioned on that, the optimal set is a subset of that friend's p <= 15 liked kinds.",
        "Once a friend is sampled, relabel his liked kinds as bits 0..q-1 with q <= 15 and compress every friend to the q-bit mask of which of those kinds he also likes. Then the number of friends who like all of a candidate mask is the sum of the compressed histogram over the supermasks of that mask - one superset zeta transform over 2^15 entries.",
        "Repeating the sample 40 times drives the failure probability to 2^-40 while the total cost stays at 40 * (n * 15 + 2^15 * 15). The answer is never overestimated, because every mask reported is genuinely liked by cnt[mask] >= ceil(n/2) friends; only underestimation is possible, and that is what the repetitions bound.",
        "The tempting deterministic route, running SOS over all m bits, needs 2^60 states. The tempting cheap fix, sampling a single friend once, is wrong half the time. Both failures come from ignoring that the halving condition is exactly what makes sampling work.",
        "Time: O(T * (n * p + 2^p * p)) for T iterations with p <= 15. Space: O(2^p + n).",
      ],
    },
  ],
};
