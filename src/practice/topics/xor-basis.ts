import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "XOR Queries of a Subarray",
      difficulty: "Easy",
      variation: "Prefix XOR groundwork",
      link: "https://leetcode.com/problems/xor-queries-of-a-subarray/",
      question: [
        "You are given an array arr of positive integers and a list of queries where queries[i] = [L, R]. For each query compute the XOR of arr[L] ^ arr[L+1] ^ ... ^ arr[R] and return the answers in order.",
        "Example 1:\nInput: arr = [1,3,4,8], queries = [[0,1],[1,2],[0,3],[3,3]]\nOutput: [2,7,14,8]\nExplanation: 1^3 = 2, 3^4 = 7, 1^3^4^8 = 14, and the single element 8.",
        "Example 2:\nInput: arr = [4,8,2,10], queries = [[2,3],[1,3],[0,0],[0,3]]\nOutput: [8,0,4,4]\nExplanation: 2^10 = 8, 8^2^10 = 0, 4 alone is 4, and 4^8^2^10 = 4.",
        "Constraints:\n- 1 <= arr.length, queries.length <= 3 * 10^4\n- 1 <= arr[i] <= 10^9\n- 0 <= L <= R < arr.length",
      ],
      code: `vector<int> xorQueries(vector<int>& arr, vector<vector<int>>& queries) {
    int n = arr.size();
    vector<int> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] ^ arr[i];   // pre[i] = XOR of the first i elements
    vector<int> ans;
    ans.reserve(queries.size());
    for (auto& q : queries) ans.push_back(pre[q[1] + 1] ^ pre[q[0]]);
    return ans;
}`,
      explanation: [
        "XOR behaves like addition over GF(2): every element is its own inverse, so a ^ a = 0. That makes a prefix table work exactly as prefix sums do, except subtraction is replaced by another XOR.",
        "With pre[i] the XOR of the first i elements, pre[R+1] ^ pre[L] cancels every element before index L and leaves precisely arr[L..R]. There is no borrow or overflow to worry about, so the identity is exact for any width.",
        "This is the prerequisite for the whole XOR-basis family: almost every hard problem in this topic first turns a subarray or subset condition into a statement about prefix XOR values, then reasons about the linear span of those values.",
        "The tempting mistake is recomputing each range by looping, which is O(n) per query and times out at 3 * 10^4 queries over a 3 * 10^4 array.",
        "Time: O(n + q). Space: O(n).",
      ],
    },
    {
      name: "Find Maximum Subset XOR",
      difficulty: "Medium",
      variation: "Linear basis template, maximum XOR of a subset",
      link: "https://www.geeksforgeeks.org/find-maximum-subset-xor-given-set/",
      question: [
        "Given an array of non-negative integers, choose any subset of them and XOR all chosen values together. Return the largest value obtainable this way. The empty subset is allowed and gives 0.",
        "Example 1:\nInput: a = [9, 8, 5]\nOutput: 13\nExplanation: 8 ^ 5 = 13, which beats 9 ^ 5 = 12, 9 ^ 8 = 1 and 9 ^ 8 ^ 5 = 4.",
        "Example 2:\nInput: a = [2, 1, 5, 3]\nOutput: 7\nExplanation: 2 ^ 5 = 7 (also 1 ^ 3 ^ 5 = 7); nothing reaches 8 because no element has bit 3 set.",
        "Constraints:\n- 1 <= a.length <= 10^5\n- 0 <= a[i] <= 10^9",
      ],
      code: `int maxSubsetXor(vector<int>& a) {
    vector<int> b(30, 0);   // b[j] = a basis vector whose highest set bit is j, or 0 if that pivot is free
    for (int v : a) {
        int x = v;
        for (int j = 29; j >= 0; j--) {
            if (!((x >> j) & 1)) continue;      // walk down to the leading bit of the reduced value
            if (!b[j]) { b[j] = x; break; }     // pivot free: x is a new independent direction
            x ^= b[j];                          // clear bit j and keep reducing
        }
        // if x reduces all the way to 0 the value was already in the span and is dropped
    }
    int res = 0;
    for (int j = 29; j >= 0; j--)
        if ((res ^ b[j]) > res) res ^= b[j];    // greedy from the top bit down
    return res;
}`,
      explanation: [
        "Treat each number as a vector of bits over the two-element field GF(2), where XOR is vector addition. The set of values reachable by XOR-ing subsets is exactly the linear span of the input vectors, so the answer only depends on a basis of that span - duplicates and dependent values are noise.",
        "Insertion keeps the basis in row-echelon form: b[j] is either 0 or a vector whose highest set bit is j. Reducing a new value against the existing pivots either exhausts it (dependent, discard) or lands it on a free pivot (independent, store). This costs O(bits) per element with no matrix and no allocation.",
        "The greedy maximisation is correct because of the echelon shape: only b[j] can flip bit j of the accumulator, so decide bit j once, from the highest bit down, and never revisit it. Taking b[j] when it raises the result is locally and globally optimal since lower bits together weigh less than bit j.",
        "The wrong-but-tempting approach is sorting and greedily XOR-ing the largest values, or trying all 2^n subsets. Sorting fails on inputs like [9, 8, 5] where the best pair does not include the maximum element.",
        "Time: O(n * B) with B the bit width. Space: O(B).",
      ],
    },
    {
      name: "XMAX - Xor Maximization",
      difficulty: "Medium",
      variation: "Judge implementation, 64-bit values",
      link: "https://www.spoj.com/problems/XMAX/",
      question: [
        "You are given a multiset of N non-negative integers. Find the maximum value of the XOR of the elements of some sub-multiset (a subset of the given numbers, possibly empty). Read N and then the N values from standard input and print the single maximum on one line.",
        "Example 1:\nInput:\n3\n1 2 3\nOutput: 3\nExplanation: 1 ^ 2 = 3, and the element 3 alone is also 3; no combination exceeds 3.",
        "Example 2:\nInput:\n4\n5 6 7 8\nOutput: 15\nExplanation: 7 ^ 8 = 15, the largest reachable value.",
        "Constraints:\n- 1 <= N <= 100\n- 0 <= each value <= 10^18",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (!(cin >> n)) return 0;
    vector<long long> b(63, 0);
    for (int i = 0; i < n; i++) {
        long long x;
        cin >> x;
        for (int j = 62; j >= 0; j--) {          // 10^18 needs 60 bits, so 63 pivots is safe
            if (!((x >> j) & 1LL)) continue;
            if (!b[j]) { b[j] = x; break; }
            x ^= b[j];
        }
    }
    long long res = 0;
    for (int j = 62; j >= 0; j--)
        if ((res ^ b[j]) > res) res ^= b[j];
    cout << res << "\\n";
    return 0;
}`,
      explanation: [
        "Identical mathematics to the previous problem; the point here is the implementation details a judge punishes. Values reach 10^18, so every basis slot, the input variable and the accumulator must be 64-bit, and shifts need the LL suffix or they are done in int and lose the high bits.",
        "The pivot loop must start above the highest possible bit (60 for 10^18) and must never touch bit 63, because a set sign bit makes the > comparison in the greedy step behave unexpectedly with signed types. Non-negative inputs guarantee bit 63 stays clear.",
        "The basis size is at most 63 regardless of N, so even a huge multiset collapses to a tiny structure - a good sanity check when debugging: if the basis ever holds two vectors with the same leading bit, the insertion loop is wrong.",
        "Time: O(N * 63). Space: O(63).",
      ],
    },
    {
      name: "Square Subsets",
      difficulty: "Medium",
      variation: "Basis over prime-parity vectors, counting the kernel",
      link: "https://codeforces.com/problemset/problem/895/C",
      question: [
        "Petya has an array of n integers, each between 2 and 70. Count the number of non-empty subsets of indices whose product is a perfect square. Two subsets are different if their index sets differ, even when the values coincide. Print the count modulo 10^9 + 7.",
        "Example 1:\nInput:\n4\n1 1 1 1\nOutput: 15\nExplanation: 1 is already a square, so every one of the 2^4 - 1 non-empty subsets works.",
        "Example 2:\nInput:\n4\n2 2 2 2\nOutput: 7\nExplanation: A subset is square exactly when it has an even number of 2s, so the 6 pairs plus the full quadruple give 7.",
        "Example 3:\nInput:\n5\n1 2 4 5 8\nOutput: 7\nExplanation: The parity vectors have rank 2 over the primes 2 and 5, so the answer is 2^(5-2) - 1 = 7.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= a[i] <= 70",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const long long MOD = 1000000007LL;
    int primes[19] = {2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67};
    int n;
    cin >> n;
    vector<int> b(19, 0);
    int r = 0;                     // rank of the parity vectors seen so far
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        int mask = 0;
        for (int j = 0; j < 19; j++) {
            int cnt = 0;
            while (x % primes[j] == 0) { x /= primes[j]; cnt++; }
            if (cnt & 1) mask |= 1 << j;          // only exponent parity matters for squareness
        }
        for (int j = 18; j >= 0; j--) {
            if (!((mask >> j) & 1)) continue;
            if (!b[j]) { b[j] = mask; r++; break; }
            mask ^= b[j];
        }
    }
    long long ans = 1;
    for (int i = 0; i < n - r; i++) ans = ans * 2 % MOD;   // 2^(n - rank) elements of the kernel
    cout << (ans - 1 + MOD) % MOD << "\\n";
    return 0;
}`,
      explanation: [
        "A product is a perfect square exactly when every prime exponent is even. Values are at most 70, so only the 19 primes below 70 can appear; map each number to a 19-bit mask of the primes with odd exponent. Multiplying numbers adds exponents, so the parity mask of a subset is the XOR of its members' masks, and the question becomes: how many subsets XOR to 0.",
        "The subsets XOR-ing to 0 form the kernel of the linear map from index-subsets to masks. That map has image of dimension r, the basis rank, so its kernel has dimension n - r and contains exactly 2^(n-r) subsets. Subtract one to drop the empty subset.",
        "This dimension argument is the counting half of the pattern and is worth memorising: the number of subsets producing any single achievable XOR value is always 2^(n-r), independent of which value it is.",
        "The trap is trying subset DP over 2^19 mask states with n up to 10^5, or counting by value multiplicities with inclusion-exclusion. The basis gives the answer in one pass and needs no DP table at all.",
        "Time: O(n * 19). Space: O(19).",
      ],
    },
    {
      name: "(Zero XOR Subset)-less",
      difficulty: "Hard",
      variation: "Rank of prefix XORs as a maximum-parts answer",
      link: "https://codeforces.com/problemset/problem/1101/G",
      question: [
        "You are given an array of n integers. Split it into the maximum possible number of non-empty consecutive subsegments so that no non-empty subset of those subsegments has XOR equal to 0 (the XOR of a subsegment is the XOR of its elements). Print that maximum number of subsegments, or -1 if no valid split exists.",
        "Example 1:\nInput:\n4\n5 5 7 2\nOutput: 2\nExplanation: The prefix XORs are 5, 0, 7, 5 and their rank is 2, so at most two subsegments are possible, for instance [5,5,7] and [2].",
        "Example 2:\nInput:\n3\n1 2 3\nOutput: -1\nExplanation: The XOR of the whole array is 0, so whatever the split, the set of all subsegments XORs to 0.",
        "Constraints:\n- 1 <= n <= 2 * 10^5\n- 0 <= a[i] <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> b(30, 0);
    int pref = 0, r = 0;
    for (int i = 0; i < n; i++) {
        int a;
        cin >> a;
        pref ^= a;
        int x = pref;                       // insert every prefix XOR, including duplicates
        for (int j = 29; j >= 0; j--) {
            if (!((x >> j) & 1)) continue;
            if (!b[j]) { b[j] = x; r++; break; }
            x ^= b[j];
        }
    }
    if (pref == 0) cout << -1 << "\\n";      // whole array XORs to 0: every split fails
    else cout << r << "\\n";
    return 0;
}`,
      explanation: [
        "Describe a split by its cut points, so a subsegment ending at index i and starting after index j has XOR p[i] ^ p[j] with p the prefix XOR array. A subset of subsegments XORs to 0 precisely when the multiset of endpoints it touches cancels, which happens iff the chosen prefix values are linearly dependent over GF(2).",
        "So a split into k parts is valid iff the k prefix values at the cut ends (the last of which is p[n]) are linearly independent. The maximum k is therefore the rank r of the whole set of prefix XORs, and any r independent prefixes can be used as the cuts.",
        "If p[n] = 0 no valid split exists at all, because the union of every subsegment is the whole array and already XORs to 0 - hence the -1 case, which must be checked separately since the rank computation is otherwise happily positive.",
        "Note that the zero vector is never inserted (the loop finds no set bit), which is exactly right: a prefix equal to 0 is dependent by definition and must not raise the rank.",
        "Time: O(n * 30). Space: O(30).",
      ],
    },
    {
      name: "Mahmoud and Ehab and yet another xor task",
      difficulty: "Hard",
      variation: "Counting subsequences with a fixed XOR",
      link: "https://codeforces.com/problemset/problem/959/F",
      question: [
        "You are given an array a of n integers and q queries. Each query gives l and x: count the subsequences of the first l elements a[1..l] whose XOR equals x, including the empty subsequence when x is 0. Two subsequences differ if their index sets differ. Print each answer modulo 10^9 + 7.",
        "Example 1:\nInput:\n5 5\n0 1 2 3 4\n4 3\n2 0\n3 7\n5 7\n5 8\nOutput:\n4\n2\n0\n4\n0\nExplanation: For l = 4 the basis of {0,1,2,3} has rank 2 and 3 lies in the span, so 2^(4-2) = 4 subsequences work. For l = 3 the span is {0,1,2,3} and 7 is outside it, so the answer is 0.",
        "Constraints:\n- 1 <= n, q <= 10^5\n- 0 <= a[i] < 2^20\n- 1 <= l <= n, 0 <= x < 2^20",
      ],
      code: `struct Query { int l, x, id; };

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const long long MOD = 1000000007LL;
    int n, q;
    cin >> n >> q;
    vector<int> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    vector<Query> qs(q);
    for (int i = 0; i < q; i++) {
        cin >> qs[i].l >> qs[i].x;
        qs[i].id = i;
    }
    sort(qs.begin(), qs.end(), [](const Query& p, const Query& s) { return p.l < s.l; });
    vector<long long> pw(n + 1, 1);
    for (int i = 1; i <= n; i++) pw[i] = pw[i - 1] * 2 % MOD;
    vector<int> b(20, 0);
    vector<long long> ans(q);
    int idx = 1, r = 0;
    for (auto& cur : qs) {
        while (idx <= cur.l) {                    // grow the prefix basis to match this query
            int v = a[idx];
            for (int j = 19; j >= 0; j--) {
                if (!((v >> j) & 1)) continue;
                if (!b[j]) { b[j] = v; r++; break; }
                v ^= b[j];
            }
            idx++;
        }
        int x = cur.x;
        bool ok = true;
        for (int j = 19; j >= 0; j--) {
            if (!((x >> j) & 1)) continue;
            if (!b[j]) { ok = false; break; }     // no pivot for this bit: x is outside the span
            x ^= b[j];
        }
        ans[cur.id] = ok ? pw[cur.l - r] : 0;
    }
    for (int i = 0; i < q; i++) cout << ans[i] << "\\n";
    return 0;
}`,
      explanation: [
        "Two facts settle every query. First, x is reachable iff reducing x against the prefix basis drives it to 0; if some bit of the reduced value has no pivot, x is outside the span. Second, when x is reachable the number of subsets producing it is exactly 2^(l-r), where r is the rank of the first l elements.",
        "The count follows from a bijection: fix one subset S with XOR x, then S XOR T also has XOR x for every subset T in the kernel, and every solution arises this way exactly once. The kernel has size 2^(l-r), so the answer never depends on x beyond the reachability test.",
        "Because a basis only grows as elements are appended, sorting the queries by l lets one left-to-right sweep serve all of them, inserting each element once. Rebuilding a basis per query would be O(q * n * 20) and too slow.",
        "The subtle case is x = 0, which is always reachable via the empty subset, and elements equal to 0, which are dependent and never raise the rank while still doubling the count - both fall out of the formula automatically.",
        "Time: O((n + q) * 20 + q log q). Space: O(n + q).",
      ],
    },
    {
      name: "Xor Sum 3",
      difficulty: "Hard",
      variation: "Splitting into two groups, maximise the sum of two XORs",
      link: "https://atcoder.jp/contests/abc141/tasks/abc141_f",
      question: [
        "There are N non-negative integers. Paint each of them either red or blue. Let X be the XOR of the red numbers and Y the XOR of the blue numbers. Maximise X + Y and print that maximum.",
        "Example 1:\nInput:\n3\n3 6 5\nOutput: 12\nExplanation: The XOR of everything is 0, so X = Y always; painting 3 and 5 red gives X = Y = 6 and X + Y = 12.",
        "Example 2:\nInput:\n4\n23 36 66 65\nOutput: 188\nExplanation: The total XOR is 48, contributing 48 once; the best free part is 70, giving 48 + 2 * 70 = 188.",
        "Constraints:\n- 2 <= N <= 10^5\n- 0 <= each value < 2^60",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<long long> a(n);
    long long total = 0;
    for (int i = 0; i < n; i++) { cin >> a[i]; total ^= a[i]; }
    vector<long long> b(60, 0);
    for (int i = 0; i < n; i++) {
        long long x = a[i] & ~total;         // keep only the bits where the total XOR is 0
        for (int j = 59; j >= 0; j--) {
            if (!((x >> j) & 1LL)) continue;
            if (!b[j]) { b[j] = x; break; }
            x ^= b[j];
        }
    }
    long long res = 0;
    for (int j = 59; j >= 0; j--)
        if ((res ^ b[j]) > res) res ^= b[j];
    cout << total + 2 * res << "\\n";
    return 0;
}`,
      explanation: [
        "Look at one bit position at a time. X ^ Y equals the XOR of all the numbers, call it T, no matter how the colours are assigned. So on a bit where T is 1, exactly one of X and Y has that bit and the position contributes its weight once - a fixed amount you cannot influence.",
        "On a bit where T is 0, X and Y agree there, so the position contributes either 0 or twice its weight. Maximising X + Y therefore reduces to maximising X restricted to the bits where T is 0, which is a plain maximum-subset-XOR over the values with those bits masked away.",
        "Hence the answer is T + 2 * M where M is the maximum XOR obtainable from the masked values. Masking with ~T before inserting is essential: without it the basis would let the greedy step buy T-bits it does not actually control, and the sum would be overstated.",
        "The tempting wrong move is a bit-by-bit greedy over all 60 bits independently, which ignores that the bits where T is 0 are linked through the same chosen subset.",
        "Time: O(N * 60). Space: O(N).",
      ],
    },
    {
      name: "Spanning Set",
      difficulty: "Hard",
      variation: "Cheapest basis, greedy by cost",
      link: "https://atcoder.jp/contests/abc236/tasks/abc236_f",
      question: [
        "You are given an integer N and the costs C(1), C(2), ..., C(2^N - 1) of buying each integer from 1 to 2^N - 1. Choose a set S of these integers, paying the cost of each element you take, so that every integer from 1 to 2^N - 1 can be written as the XOR of some non-empty subset of S. Print the minimum total cost.",
        "Example 1:\nInput:\n2\n1 2 3\nOutput: 3\nExplanation: The costs of 1, 2 and 3 are 1, 2 and 3. Buying 1 and 2 costs 3 and spans everything, since 3 = 1 ^ 2.",
        "Example 2:\nInput:\n2\n10 1 2\nOutput: 3\nExplanation: Now 2 costs 1 and 3 costs 2. Buying 2 and 3 costs 3 and still spans everything, because 2 ^ 3 = 1; buying the expensive 1 is unnecessary.",
        "Constraints:\n- 1 <= N <= 18\n- 1 <= C(i) <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    int m = (1 << n) - 1;
    vector<pair<long long,int>> v(m);
    for (int i = 1; i <= m; i++) {
        long long c;
        cin >> c;
        v[i - 1] = {c, i};                       // (cost, value)
    }
    sort(v.begin(), v.end());                    // cheapest first
    vector<int> b(n, 0);
    long long ans = 0;
    int cnt = 0;
    for (auto& [c, val] : v) {
        int x = val;
        for (int j = n - 1; j >= 0; j--) {
            if (!((x >> j) & 1)) continue;
            if (!b[j]) { b[j] = val; ans += c; cnt++; break; }   // independent: buy it
            x ^= b[j];
        }
        if (cnt == n) break;                     // n independent vectors already span everything
    }
    cout << ans << "\\n";
    return 0;
}`,
      explanation: [
        "Spanning all of 1..2^N - 1 means the chosen set spans the whole N-dimensional space over GF(2), so S must contain N linearly independent values and nothing more is ever useful. The task is thus: pick the cheapest basis of the full space.",
        "The matroid exchange property makes the greedy optimal, exactly as in Kruskal's algorithm: process values in increasing cost and buy one whenever it is independent of what you already hold. If a cheaper independent set could be improved by skipping an accepted vector, the exchange lemma would produce a cheaper alternative for that same rank, contradicting the order of processing.",
        "The independence test is one basis insertion. Note the vector stored is the original val while the reduction continues on the working copy x - storing the reduced form is also correct, but the two must not be mixed up in the same array.",
        "The trap is assuming the answer is always the N single-bit powers of two. Example 2 shows why not: buying 2 and 3 can be strictly cheaper than buying 1 and 2, because any basis works.",
        "Time: O(2^N * (N + log(2^N))). Space: O(2^N).",
      ],
    },
    {
      name: "Xor Query",
      difficulty: "Hard",
      variation: "Range representability via a position-aware basis",
      link: "https://atcoder.jp/contests/abc223/tasks/abc223_h",
      question: [
        "You are given a sequence A of length N and Q queries. Each query gives L, R and X: decide whether X can be written as the XOR of some non-empty subsequence of A[L], A[L+1], ..., A[R]. Print Yes or No for each query.",
        "Example 1:\nInput:\n3 3\n1 2 3\n1 2 3\n1 1 3\n2 3 1\nOutput:\nYes\nNo\nYes\nExplanation: In A[1..2] we have 1 ^ 2 = 3. In A[1..1] the only value is 1, so 3 is unreachable. In A[2..3] we have 2 ^ 3 = 1.",
        "Example 2:\nInput:\n4 2\n5 6 7 8\n1 4 15\n3 4 2\nOutput:\nYes\nNo\nExplanation: 7 ^ 8 = 15. Within A[3..4] = {7, 8} the reachable values are 7, 8 and 15, so 2 is impossible.",
        "Constraints:\n- 1 <= N, Q <= 2 * 10^5\n- 1 <= A[i] < 2^60\n- 1 <= L <= R <= N, 1 <= X < 2^60",
      ],
      code: `struct Query { int l, r, id; long long x; };

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<long long> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    vector<Query> qs(q);
    for (int i = 0; i < q; i++) {
        cin >> qs[i].l >> qs[i].r >> qs[i].x;
        qs[i].id = i;
    }
    sort(qs.begin(), qs.end(), [](const Query& p, const Query& s) { return p.r < s.r; });
    vector<long long> bas(60, 0);
    vector<int> pos(60, 0);        // pos[j] = index of the element that produced bas[j]
    vector<char> ans(q, 0);
    int idx = 1;
    for (auto& cur : qs) {
        while (idx <= cur.r) {
            long long v = a[idx];
            int p = idx;
            for (int j = 59; j >= 0; j--) {
                if (!((v >> j) & 1LL)) continue;
                if (!bas[j]) { bas[j] = v; pos[j] = p; break; }
                if (pos[j] < p) { swap(bas[j], v); swap(pos[j], p); }   // keep the fresher vector as the pivot
                v ^= bas[j];
            }
            idx++;
        }
        long long x = cur.x;
        bool ok = true;
        for (int j = 59; j >= 0 && x; j--) {
            if (!((x >> j) & 1LL)) continue;
            if (pos[j] < cur.l) { ok = false; break; }   // only vectors from index >= l may be used
            x ^= bas[j];
        }
        ans[cur.id] = (ok && x == 0) ? 1 : 0;
    }
    for (int i = 0; i < q; i++) cout << (ans[i] ? "Yes" : "No") << "\\n";
    return 0;
}`,
      explanation: [
        "Representability is again a span test, but the span now depends on the window [L, R]. Rebuilding a basis per query is O(Q * N * 60) and hopeless, so the basis has to carry information about which suffix of the prefix it can be attributed to.",
        "The fix is a position-aware (time-based) basis over the prefix ending at R. Every stored vector remembers the index that introduced it, and on insertion the pivot is always kept as the vector with the larger index, pushing the older one further down. The invariant this maintains is: the vectors with pos >= L span exactly the same space as the window A[L..R]. That is the whole trick and it is worth proving once on paper - any window element is reachable from pivots with position at least L, since every reduction step only ever XORs in a vector whose index is at least as large.",
        "Answering is then the ordinary reduction, skipping (and failing on) any pivot whose position is older than L. Sorting queries by R lets one sweep handle all of them, since the basis only ever absorbs new elements.",
        "The naive alternatives - a segment tree of bases merged per query, or an offline sqrt decomposition - also pass but cost an extra log or worse in both time and code volume; the position trick is O((N + Q) * 60).",
        "Time: O((N + Q) * 60 + Q log Q). Space: O(N + Q).",
      ],
    },
    {
      name: "Ivan and Burgers",
      difficulty: "Hard",
      variation: "Range maximum-XOR queries",
      link: "https://codeforces.com/problemset/problem/1100/F",
      question: [
        "There are n burgers with costs c[1..n]. For each of q queries (l, r) Ivan may buy any subset of the burgers with indices in [l, r]; the amount of money he loses is the XOR of the costs he buys. Starting from an unlimited balance he wants to lose as much as possible, so for each query print the maximum XOR of a subset of c[l..r] (0 if he buys nothing).",
        "Example 1:\nInput:\n4\n7 2 3 4\n3\n1 4\n2 3\n1 3\nOutput:\n7\n3\n7\nExplanation: On [1,4] nothing beats 7 itself. On [2,3] the options are 2, 3 and 2 ^ 3 = 1, so 3 is best. On [1,3] the best is again 7.",
        "Example 2:\nInput:\n5\n12 14 23 13 7\n1\n1 5\nOutput:\n31\nExplanation: The five costs span all 5 bits: 23 ^ 7 ^ 14 ^ 13 ^ 12 = 31, the largest value below 32.",
        "Constraints:\n- 1 <= n <= 5 * 10^5\n- 0 <= c[i] < 10^6\n- 1 <= q <= 5 * 10^5\n- 1 <= l <= r <= n",
      ],
      code: `struct Query { int l, r, id; };

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> c(n + 1);
    for (int i = 1; i <= n; i++) cin >> c[i];
    int q;
    cin >> q;
    vector<Query> qs(q);
    for (int i = 0; i < q; i++) {
        cin >> qs[i].l >> qs[i].r;
        qs[i].id = i;
    }
    sort(qs.begin(), qs.end(), [](const Query& p, const Query& s) { return p.r < s.r; });
    vector<int> bas(20, 0), pos(20, 0);
    vector<int> ans(q, 0);
    int idx = 1;
    for (auto& cur : qs) {
        while (idx <= cur.r) {
            int v = c[idx], p = idx;
            for (int j = 19; j >= 0; j--) {
                if (!((v >> j) & 1)) continue;
                if (!bas[j]) { bas[j] = v; pos[j] = p; break; }
                if (pos[j] < p) { swap(bas[j], v); swap(pos[j], p); }   // newest index wins the pivot
                v ^= bas[j];
            }
            idx++;
        }
        int res = 0;
        for (int j = 19; j >= 0; j--)
            if (pos[j] >= cur.l && (res ^ bas[j]) > res) res ^= bas[j];  // greedy over usable pivots only
        ans[cur.id] = res;
    }
    for (int i = 0; i < q; i++) cout << ans[i] << "\\n";
    return 0;
}`,
      explanation: [
        "This is the maximisation twin of the range representability problem, and it uses the same position-aware basis: after absorbing the prefix up to r, the pivots with pos >= l span exactly the window c[l..r].",
        "The greedy then runs over that filtered set. It stays correct because the echelon property is untouched by filtering: each surviving bas[j] is still the only usable vector whose leading bit is j, so deciding bit j once, from the top down, cannot be improved later by lower pivots.",
        "The swap on insertion is what makes the filter sound. Without it an old vector could occupy a pivot that a newer, equally valid vector could have held, and a query with a large l would then wrongly report that bit as unreachable.",
        "Costs are below 10^6, so 20 bits suffice; using 30 or 60 only wastes time in the hot loop, which matters at 5 * 10^5 queries. A merge-able segment tree of bases is the standard alternative and costs an extra factor of log n times the basis size.",
        "Time: O((n + q) * 20 + q log q). Space: O(n + q).",
      ],
    },
    {
      name: "Shortest Path Problem?",
      difficulty: "Hard",
      variation: "Cycle-space basis, minimum XOR path in a graph",
      link: "https://codeforces.com/problemset/problem/845/G",
      question: [
        "You are given a connected undirected graph with n vertices and m edges; edge i has a non-negative weight. The length of a route is the XOR of the weights of the edges it uses, counting an edge every time it is traversed. Find the minimum possible length of a route from vertex 1 to vertex n. Routes may repeat vertices and edges.",
        "Example 1:\nInput:\n3 3\n1 2 3\n1 3 2\n3 2 0\nOutput: 2\nExplanation: The direct edge 1-3 gives 2. The only cycle has value 3 ^ 2 ^ 0 = 1 and 2 ^ 1 = 3 is worse, so 2 stands.",
        "Example 2:\nInput:\n2 2\n1 1 3\n1 2 3\nOutput: 0\nExplanation: The self-loop at vertex 1 has value 3, so walking the loop and then the edge to vertex 2 gives 3 ^ 3 = 0.",
        "Constraints:\n- 1 <= n <= 10^5\n- 1 <= m <= 10^5\n- 0 <= weight < 10^8\n- The graph is connected and may contain self-loops and multiple edges",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<pair<int,int>>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v, w;
        cin >> u >> v >> w;
        adj[u].push_back({v, w});
        adj[v].push_back({u, w});
    }
    vector<int> d(n + 1, 0), vis(n + 1, 0), b(30, 0);
    auto add = [&](int x) {                       // insert a cycle value into the basis
        for (int j = 29; j >= 0; j--) {
            if (!((x >> j) & 1)) continue;
            if (!b[j]) { b[j] = x; return; }
            x ^= b[j];
        }
    };
    queue<int> qu;
    qu.push(1);
    vis[1] = 1;
    while (!qu.empty()) {
        int u = qu.front(); qu.pop();
        for (auto& [v, w] : adj[u]) {
            if (!vis[v]) { vis[v] = 1; d[v] = d[u] ^ w; qu.push(v); }
            else add(d[u] ^ d[v] ^ w);            // non-tree edge closes exactly one cycle
        }
    }
    int res = d[n];
    for (int j = 29; j >= 0; j--)
        if ((res ^ b[j]) < res) res ^= b[j];      // greedy minimisation from the top bit down
    cout << res << "\\n";
    return 0;
}`,
      explanation: [
        "Build any spanning tree from vertex 1 and let d[v] be the XOR of weights on the tree path to v. Every route from 1 to n has value d[n] XOR (some element of the cycle space), because traversing an edge twice cancels it and any closed walk decomposes into fundamental cycles.",
        "The cycle space has a basis of size m - n + 1: one fundamental cycle per non-tree edge (u, v, w), of value d[u] ^ d[v] ^ w. Feeding all of them into a linear basis gives the full set of adjustments available, and self-loops are handled for free since d[u] ^ d[u] ^ w = w.",
        "Reachability is not an obstacle - the graph is connected, and any cycle anywhere can be reached, walked and returned from at zero net cost, so the whole cycle space applies to every route regardless of where the cycles sit.",
        "The final step is minimisation rather than maximisation: take b[j] only when it lowers the accumulator. Because the basis is in echelon form, that means clearing bit j whenever a pivot for it exists - so the result is the canonical reduced form of d[n], and it is unique.",
        "Trying Dijkstra or BFS on XOR weights is the classic wrong instinct: XOR is not monotone under path extension, so no shortest-path relaxation argument holds and a longer walk can be strictly better.",
        "Time: O((n + m) * 30). Space: O(n + m).",
      ],
    },
  ],
};
