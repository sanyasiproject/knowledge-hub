import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Extended Euclidean Algorithm",
      difficulty: "Easy",
      variation: "Bezout coefficients, the template",
      question: [
        "Given two non-negative integers a and b, not both zero, compute g = gcd(a, b) together with one pair of integers (x, y) such that a*x + b*y = g. Such a pair always exists and is called a pair of Bezout coefficients. Return g and report the pair.",
        "Example 1:\nInput: a = 35, b = 15\nOutput: g = 5, x = 1, y = -2\nExplanation: gcd(35, 15) = 5 and 35*1 + 15*(-2) = 35 - 30 = 5.",
        "Example 2:\nInput: a = 30, b = 20\nOutput: g = 10, x = 1, y = -1\nExplanation: gcd(30, 20) = 10 and 30*1 + 20*(-1) = 10.",
        "Constraints:\n- 0 <= a, b <= 10^18\n- a and b are not both zero",
      ],
      code: `// Returns gcd(a, b) and fills x, y with a*x + b*y = gcd(a, b).
long long extgcd(long long a, long long b, long long &x, long long &y) {
    if (b == 0) {
        x = 1;                 // a*1 + 0*0 = a = gcd(a, 0)
        y = 0;
        return a;
    }
    long long x1, y1;
    long long g = extgcd(b, a % b, x1, y1);   // b*x1 + (a % b)*y1 = g
    // a % b = a - (a / b)*b, so substitute and regroup by a and b:
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}`,
      explanation: [
        "The plain Euclidean algorithm only tracks the remainder chain. The extended version carries the coefficients back up that same chain, so the recursion is unchanged and only the return step does extra work.",
        "The unwinding step is one substitution. The child call guarantees b*x1 + (a mod b)*y1 = g. Write a mod b as a - floor(a/b)*b, expand, and collect: a*y1 + b*(x1 - floor(a/b)*y1) = g. That is exactly the assignment in the code, which is why the identity holds at every level down to the base case a*1 + 0*0 = a.",
        "The coefficients stay small: the returned pair always satisfies |x| <= b/(2g) and |y| <= a/(2g), so no overflow appears for 64-bit inputs even though intermediate products look alarming. The real trap is passing negative a or b and then trusting the signs - C++ truncates division toward zero, so normalise to absolute values first and flip the sign of x or y afterwards.",
        "Bezout is also the reason the whole topic works: a*x + b*y ranges over exactly the multiples of gcd(a, b) as x and y range over the integers, nothing more and nothing less.",
        "Time: O(log min(a, b)). Space: O(log min(a, b)) for the recursion stack, O(1) if written iteratively.",
      ],
    },
    {
      name: "Linear Diophantine Equation - Find Any Solution",
      difficulty: "Easy",
      variation: "Solvability test and one particular solution",
      question: [
        "Given integers a, b and c with a and b not both zero, decide whether the equation a*x + b*y = c has a solution in integers. If it does, report any one solution (x0, y0), and also describe the full family of solutions.",
        "The family is x = x0 + (b/g)*t, y = y0 - (a/g)*t for every integer t, where g = gcd(a, b).",
        "Example 1:\nInput: a = 25, b = 15, c = 35\nOutput: solvable, x0 = -7, y0 = 14\nExplanation: g = gcd(25, 15) = 5 divides 35. Extended gcd gives 25*(-1) + 15*2 = 5, and scaling by 35/5 = 7 gives 25*(-7) + 15*14 = -175 + 210 = 35.",
        "Example 2:\nInput: a = 4, b = 6, c = 7\nOutput: no solution\nExplanation: every value of 4x + 6y is even because gcd(4, 6) = 2, and 7 is odd.",
        "Constraints:\n- -10^9 <= a, b, c <= 10^9\n- a and b are not both zero",
      ],
      code: `long long extgcd(long long a, long long b, long long &x, long long &y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long x1, y1;
    long long g = extgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}

// True if a*x + b*y = c is solvable; then x0, y0 hold one solution and g the gcd.
bool diophantine(long long a, long long b, long long c,
                 long long &x0, long long &y0, long long &g) {
    g = extgcd(llabs(a), llabs(b), x0, y0);   // work with magnitudes
    if (c % g != 0) return false;             // c must be a multiple of the gcd
    long long k = c / g;
    x0 *= k;                                  // scale the Bezout pair up to c
    y0 *= k;
    if (a < 0) x0 = -x0;                      // undo the sign normalisation
    if (b < 0) y0 = -y0;
    return true;
}`,
      explanation: [
        "Solvability is a one-line test. Every integer combination a*x + b*y is a multiple of g = gcd(a, b), so c not divisible by g is hopeless. Conversely extended gcd produces a*p + b*q = g, and multiplying that identity by c/g produces a genuine solution, so divisibility is both necessary and sufficient.",
        "The general solution follows from uniqueness of the reduced equation: if (x, y) and (x0, y0) both work then a*(x - x0) = -b*(y - y0). Divide by g to get a', b' coprime; then b' must divide x - x0, giving x = x0 + b'*t and forcing y = y0 - a'*t. So the solutions form a single arithmetic lattice with steps b/g and a/g - not two independent free parameters.",
        "The tempting wrong move is to run extended gcd on signed inputs and use the result directly. Truncating division makes the recursion behave inconsistently for negatives, so normalise to absolute values and flip the sign of x0 or y0 at the end.",
        "Watch the scaling overflow: x0 can be as large as b/(2g) and k as large as c/g, so for inputs near 10^18 the product needs __int128 or a problem guarantee that a small solution exists.",
        "Time: O(log min(|a|, |b|)). Space: O(log min(|a|, |b|)).",
      ],
    },
    {
      name: "CEQU - Crucial Equation",
      difficulty: "Easy",
      variation: "Pure feasibility over many queries",
      link: "https://www.spoj.com/problems/CEQU/",
      question: [
        "You are given T queries. Each query gives three positive integers a, b and c, and asks whether the equation a*x + b*y = c has a solution in integers x and y. For the i-th query print a line of the form 'Case i: Yes' or 'Case i: No'.",
        "Example 1:\nInput:\n2\n2 4 8\n3 6 7\nOutput:\nCase 1: Yes\nCase 2: No\nExplanation: gcd(2, 4) = 2 divides 8, and one witness is 2*0 + 4*2 = 8. gcd(3, 6) = 3 does not divide 7, so 3x + 6y is always a multiple of 3 and can never be 7.",
        "Constraints:\n- 1 <= T <= 10^4\n- 1 <= a, b, c <= 10^18",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    for (int tc = 1; tc <= t; tc++) {
        long long a, b, c;
        cin >> a >> b >> c;
        long long g = std::gcd(a, b);
        // Bezout: the reachable values of a*x + b*y are exactly the multiples of g.
        cout << "Case " << tc << ": " << (c % g == 0 ? "Yes" : "No") << "\\n";
    }
    return 0;
}`,
      explanation: [
        "This is the feasibility half of the pattern with nothing else attached. No coefficients are needed, only the divisibility test c mod gcd(a, b) == 0, which is exactly Bezout's identity read as a statement about which right-hand sides are reachable.",
        "It is worth being precise about what the test does and does not promise. It promises an integer solution; it says nothing about a solution with x and y both positive. If a problem demands positivity you must additionally slide t along the lattice and check that a common t makes both coordinates positive, which can fail even when the equation is solvable.",
        "With values up to 10^18 the only implementation trap is the type: use long long throughout and rely on std::gcd from <numeric>, which is O(log) and never overflows because it only ever takes remainders.",
        "Time: O(T log(max(a, b))). Space: O(1).",
      ],
    },
    {
      name: "Modular Multiplicative Inverse",
      difficulty: "Easy",
      variation: "Inverse as the special case a*x + m*y = 1",
      question: [
        "Given two positive integers a and m, find the modular multiplicative inverse of a modulo m: the unique value x in the range [0, m) with (a*x) mod m == 1. If a and m are not coprime the inverse does not exist; report -1 in that case.",
        "Example 1:\nInput: a = 3, m = 11\nOutput: 4\nExplanation: 3*4 = 12 = 11 + 1, so 3*4 mod 11 = 1.",
        "Example 2:\nInput: a = 10, m = 17\nOutput: 12\nExplanation: 10*12 = 120 = 7*17 + 1, so 10*12 mod 17 = 1.",
        "Example 3:\nInput: a = 6, m = 9\nOutput: -1\nExplanation: gcd(6, 9) = 3, so 6x is always a multiple of 3 modulo 9 and can never equal 1.",
        "Constraints:\n- 1 <= a, m <= 10^9\n- m may be composite, so Fermat's little theorem does not apply",
      ],
      code: `long long extgcd(long long a, long long b, long long &x, long long &y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long x1, y1;
    long long g = extgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}

long long modInverse(long long a, long long m) {
    long long x, y;
    long long g = extgcd(a % m, m, x, y);   // (a % m)*x + m*y = g
    if (g != 1) return -1;                  // inverse exists only when coprime
    return ((x % m) + m) % m;               // x may be negative, normalise
}`,
      explanation: [
        "The congruence a*x = 1 (mod m) says a*x - 1 is a multiple of m, that is a*x + m*y = 1 for some integer y. So a modular inverse is nothing but a linear Diophantine equation with c = 1, and the Bezout test tells you immediately that it is solvable exactly when gcd(a, m) = 1.",
        "The x returned by extended gcd is one representative of the solution lattice and may be negative or larger than m, so reduce it into [0, m). Because the step of the lattice is m/g = m, that reduction gives the unique inverse in the range.",
        "The tempting shortcut is fast power with Fermat: a^(m-2) mod m. That is only valid when m is prime. For composite m it silently returns a wrong number instead of failing, which is far worse than an error. Extended gcd works for every modulus and also detects the non-coprime case for free.",
        "Reduce a modulo m before the call so a stays in range, and keep everything in long long since a*x is compared against multiples of m.",
        "Time: O(log m). Space: O(log m) for the recursion.",
      ],
    },
    {
      name: "Water and Jug Problem",
      difficulty: "Medium",
      variation: "Bezout reachability with a capacity cap",
      link: "https://leetcode.com/problems/water-and-jug-problem/",
      question: [
        "You have two jugs with capacities x and y litres and an infinite supply of water. You may completely fill a jug, completely empty a jug, or pour from one jug into the other until the source is empty or the destination is full. Determine whether you can end up with exactly target litres of water measured out using the two jugs.",
        "Example 1:\nInput: x = 3, y = 5, target = 4\nOutput: true\nExplanation: fill the 5, pour into the 3 leaving 2 in the big jug, empty the 3, pour the 2 across, fill the 5 again and top up the 3 (which needs 1), leaving exactly 4 in the big jug.",
        "Example 2:\nInput: x = 2, y = 6, target = 5\nOutput: false\nExplanation: every reachable amount is a multiple of gcd(2, 6) = 2, and 5 is odd.",
        "Constraints:\n- 1 <= x, y, target <= 10^6",
      ],
      code: `bool canMeasureWater(int x, int y, int target) {
    if (target == 0) return true;                    // nothing to measure
    if ((long long)x + y < target) return false;     // physically cannot hold it
    return target % std::gcd(x, y) == 0;                // Bezout condition
}`,
      explanation: [
        "Model the total amount of water held by the two jugs. Every legal operation changes that total by exactly +x, -x, +y or -y: filling adds a full capacity, emptying removes one, and pouring between jugs moves water without changing the total. So every reachable total is of the form x*a + y*b with integer a and b, and by Bezout the reachable set is precisely the multiples of gcd(x, y).",
        "The converse direction needs the extra cap. A Diophantine solution with, say, a > 0 > b is realised physically by repeatedly filling the x jug and dumping it into the y jug, emptying y whenever it overflows - the coefficients become a count of fills and empties, so any multiple of the gcd up to x + y is genuinely constructible. Nothing above x + y is, because the jugs cannot hold it.",
        "The classic mistake is BFS over states (a, b) with a <= x, b <= y. It is correct but does up to 10^12 work for the given limits, so it times out; the gcd insight collapses the whole search to one modulo.",
        "The other mistake is dropping the x + y < target guard. Without it the function claims target = 10^6 is measurable with jugs of size 1 and 1, since gcd 1 divides everything.",
        "Time: O(log min(x, y)). Space: O(1).",
      ],
    },
    {
      name: "I Hate 1111",
      difficulty: "Medium",
      variation: "Non-negative solutions only",
      link: "https://codeforces.com/problemset/problem/1526/B",
      question: [
        "For each query you are given a positive integer x. Decide whether x can be written as a sum of numbers taken from 11, 111, 1111, 11111, ... where each value may be used any number of times, including zero. Print 'YES' or 'NO' for each query.",
        "Every allowed value with four or more digits is itself a non-negative sum of 11s and 111s - for instance 1111 = 11*101 and 11111 = 111 + 11*1000 - so the question reduces to whether x = 11*p + 111*q has a solution with p >= 0 and q >= 0.",
        "Example 1:\nInput:\n3\n33\n144\n69\nOutput:\nYES\nYES\nNO\nExplanation: 33 = 11*3. 144 = 111 + 11*3. For 69 the only usable q values are 0 (69 is not a multiple of 11, since 69 = 6*11 + 3) and there is no room for a 111, so it is impossible.",
        "Constraints:\n- 1 <= t <= 10^4\n- 1 <= x <= 10^9",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        long long x;
        cin >> x;
        // 111 = 11*10 + 1, so 111*q mod 11 = q: q must be congruent to x mod 11.
        long long q = x % 11;          // smallest legal count of 111s
        cout << (x >= 111 * q ? "YES" : "NO") << "\\n";
    }
    return 0;
}`,
      explanation: [
        "Only 11 and 111 matter. Any longer repunit-style term is a non-negative combination of those two, so allowing them adds nothing. That leaves 11*p + 111*q = x with p, q >= 0, a Diophantine equation restricted to the first quadrant.",
        "Since gcd(11, 111) = 1 the equation always has integer solutions; the whole difficulty is the non-negativity. Reduce modulo 11: 111 = 11*10 + 1, so the equation forces q = x (mod 11). Along the solution lattice q moves in steps of 11, so the smallest non-negative choice is q0 = x mod 11 and every other candidate is larger. If even q0 does not fit, that is if 111*q0 > x, nothing does. If it does fit, the leftover x - 111*q0 is divisible by 11 by construction and gives p >= 0.",
        "That is the general recipe for 'non-negative solutions': pin one variable to its smallest residue class representative modulo the other coefficient over the gcd, then check the remaining variable once. Looping q from 0 to x/111 also works here but is 10^7 iterations per query and dies on 10^4 queries.",
        "A subtle trap is trying to minimise p instead of q: p moves in steps of 111 and its residue class is modulo 111, so the same argument works but with a coarser lattice - either variable is fine as long as you take the minimal representative of the right modulus.",
        "Time: O(1) per query. Space: O(1).",
      ],
    },
    {
      name: "Throw (AtCoder ABC 186 E)",
      difficulty: "Medium",
      variation: "Linear congruence k*t = -s (mod n)",
      link: "https://atcoder.jp/contests/abc186/tasks/abc186_e",
      question: [
        "There are n squares arranged in a circle, numbered 0 through n-1 clockwise. A ball starts on square s, with 1 <= s < n. One operation moves the ball k squares clockwise, so a ball on square i moves to square (i + k) mod n. Find the minimum number of operations needed to bring the ball to square 0, or report -1 if it can never reach square 0. Answer t independent test cases.",
        "Example 1:\nInput:\n1\n10 4 3\nOutput: 2\nExplanation: n = 10, s = 4, k = 3. After one operation the ball is on 7, after two it is on (7 + 3) mod 10 = 0.",
        "Example 2:\nInput:\n1\n1000 11 2\nOutput: -1\nExplanation: k = 2 and n = 1000 are both even, so the parity of the position never changes; starting from the odd square 11 the ball only ever visits odd squares and 0 is even.",
        "Constraints:\n- 1 <= t <= 10\n- 2 <= n <= 10^9\n- 1 <= s < n\n- 1 <= k <= 10^9",
      ],
      code: `long long extgcd(long long a, long long b, long long &x, long long &y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long x1, y1;
    long long g = extgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}

long long modInverse(long long a, long long m) {
    long long x, y;
    extgcd(a % m, m, x, y);
    return ((x % m) + m) % m;      // caller guarantees gcd(a, m) = 1
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        long long n, s, k;
        cin >> n >> s >> k;
        long long g = std::gcd(k, n);
        if (s % g != 0) {          // s must lie in the subgroup generated by k
            cout << -1 << "\\n";
            continue;
        }
        long long nn = n / g, kk = k / g, ss = s / g;
        long long rhs = ((-ss) % nn + nn) % nn;         // right side of k'*x = -s'
        long long ans = rhs % nn * modInverse(kk, nn) % nn;
        cout << ans << "\\n";
    }
    return 0;
}`,
      explanation: [
        "After x operations the ball sits on (s + k*x) mod n, so the question is the smallest non-negative x with k*x + n*y = -s, a linear Diophantine equation in disguise. It is solvable exactly when g = gcd(k, n) divides s, which is the -1 test.",
        "Once divisibility holds, divide the whole congruence by g. Now k/g and n/g are coprime, so k/g is invertible modulo n/g and the solution is a single residue class: x = (-s/g) * inverse(k/g) mod (n/g). Reducing that representative into [0, n/g) gives the minimum, because the solutions differ by multiples of n/g and any smaller value would be negative.",
        "Note why x = 0 is never returned here: it would mean s is a multiple of n, impossible given 1 <= s < n. So the reduced representative is automatically a legal positive operation count.",
        "The wrong-but-tempting approach is simulation, or a Floyd-style cycle walk. The orbit has length n/g which reaches 10^9, so it must be solved algebraically. The other trap is forgetting to divide by g before inverting: k has no inverse modulo n when g > 1, and a blind extended-gcd call returns garbage instead of failing.",
        "Keep the product rhs * inverse in 64-bit; both factors are below n/g <= 10^9 so the product is under 10^18 and fits, but int would overflow silently.",
        "Time: O(log n) per test case. Space: O(log n).",
      ],
    },
    {
      name: "Check If It Is a Good Array",
      difficulty: "Hard",
      variation: "Bezout over n coefficients",
      link: "https://leetcode.com/problems/check-if-it-is-a-good-array/",
      question: [
        "Given an array nums of positive integers, the array is called good if it is possible to pick a subset of its elements, multiply each chosen element by any integer coefficient, and have the results sum to exactly 1. Return true if nums is good and false otherwise.",
        "Example 1:\nInput: nums = [12, 5, 7, 23]\nOutput: true\nExplanation: 5*3 + 7*(-2) = 15 - 14 = 1, so the subset {5, 7} already witnesses it.",
        "Example 2:\nInput: nums = [29, 6, 10]\nOutput: true\nExplanation: 29*1 + 6*(-3) + 10*(-1) = 29 - 18 - 10 = 1.",
        "Example 3:\nInput: nums = [3, 6]\nOutput: false\nExplanation: every combination 3a + 6b is a multiple of 3.",
        "Constraints:\n- 1 <= nums.length <= 10^5\n- 1 <= nums[i] <= 10^9",
      ],
      code: `bool isGoodArray(vector<int>& nums) {
    int g = 0;
    for (int v : nums) {
        g = std::gcd(g, v);          // gcd(0, v) = v, so g starts correctly
        if (g == 1) return true;  // early exit: the gcd can never grow again
    }
    return g == 1;
}`,
      explanation: [
        "Bezout generalises from two numbers to n: the set of integer combinations a1*x1 + ... + an*xn is exactly the set of multiples of gcd(a1, ..., an). So the array is good if and only if the gcd of all elements is 1, and the whole problem collapses to a fold.",
        "The induction that justifies it is worth seeing. For two elements it is Bezout. For more, the combinations of a1 and a2 are the multiples of d = gcd(a1, a2), and adding a3 gives the multiples of gcd(d, a3) - so folding gcd left to right computes the generator of the whole lattice. The 'pick a subset' wording is a red herring: unused elements are just elements with coefficient 0, and a subset can never have a smaller gcd than the full array.",
        "The early return is not just a speed trick, it is the reason the loop is cheap: the running gcd is non-increasing, so once it hits 1 nothing can change it.",
        "The tempting wrong approach is a subset-sum or reachability DP over sums, which is both exponential and unnecessary - the coefficients are unbounded integers of either sign, which is precisely the situation where the lattice argument applies and bounded DP does not.",
        "Time: O(n log(max nums)). Space: O(1).",
      ],
    },
    {
      name: "Check if Point Is Reachable",
      difficulty: "Hard",
      variation: "gcd invariant of a move set",
      link: "https://leetcode.com/problems/check-if-point-is-reachable/",
      question: [
        "You start on an infinite 2D grid at the point (1, 1). From a point (x, y) you may move to (x, y - x), (x - y, y), (2*x, y) or (x, 2*y). Given targetX and targetY, return true if the point (targetX, targetY) is reachable and false otherwise.",
        "Example 1:\nInput: targetX = 6, targetY = 9\nOutput: false\nExplanation: gcd(6, 9) = 3, which has an odd factor greater than 1, so the point is unreachable.",
        "Example 2:\nInput: targetX = 4, targetY = 7\nOutput: true\nExplanation: gcd(4, 7) = 1, a power of two, so a sequence of moves exists.",
        "Constraints:\n- 1 <= targetX, targetY <= 10^9",
      ],
      code: `bool isReachable(int targetX, int targetY) {
    int g = std::gcd(targetX, targetY);
    return (g & (g - 1)) == 0;   // g is a power of two (g >= 1 always)
}`,
      explanation: [
        "Find a quantity the moves cannot change. Let g = gcd(x, y) and strip all factors of 2 from it to get the odd part. Subtracting one coordinate from the other leaves the gcd untouched, exactly as in the Euclidean algorithm, and doubling a coordinate can only multiply the gcd by 2 or leave it alone - either way the odd part of the gcd is invariant. The start point (1, 1) has odd part 1, so every reachable point must have gcd equal to a power of two.",
        "Sufficiency is the Bezout direction, seen by running the moves backwards. From a target with gcd a power of two, halve whichever coordinate is even, and when both are odd subtract the smaller from the larger - the subtract-and-halve process is exactly a binary gcd run, and it terminates at (1, 1) because the gcd carries no odd factor to get stuck on. Reversing that trace is a legal forward path.",
        "The trap is attempting a BFS or DFS over grid points. Coordinates go to 10^9 and doubling makes the reachable set enormous, so search is hopeless; the invariant is the only way in. A second trap is testing whether targetX and targetY are individually powers of two, which wrongly rejects (4, 7).",
        "Since g >= 1 always, the bit trick g & (g - 1) is safe and needs no zero guard.",
        "Time: O(log min(targetX, targetY)). Space: O(1).",
      ],
    },
    {
      name: "Line (Codeforces 7C)",
      difficulty: "Hard",
      variation: "A*x + B*y + C = 0 with large signed coefficients",
      link: "https://codeforces.com/problemset/problem/7/C",
      question: [
        "A line on the plane is described by the equation A*x + B*y + C = 0, where A and B are not both zero. Find any point with integer coordinates that lies on the line, or report -1 if the line passes through no lattice point.",
        "Example 1:\nInput: 2 5 3\nOutput: 6 -3\nExplanation: the equation is 2x + 5y = -3, and 2*6 + 5*(-3) = 12 - 15 = -3. Any other lattice point on the line, such as (1, -1), is also accepted.",
        "Example 2:\nInput: 2 4 3\nOutput: -1\nExplanation: 2x + 4y is always even but -C = -3 is odd, so no lattice point exists.",
        "Constraints:\n- -2*10^9 <= A, B, C <= 2*10^9\n- A and B are not both zero\n- any valid answer is accepted",
      ],
      code: `long long extgcd(long long a, long long b, long long &x, long long &y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long x1, y1;
    long long g = extgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long A, B, C;
    cin >> A >> B >> C;
    long long x, y;
    long long g = extgcd(llabs(A), llabs(B), x, y);   // |A|*x + |B|*y = g
    long long rhs = -C;
    if (rhs % g != 0) {
        cout << -1 << "\\n";
        return 0;
    }
    long long k = rhs / g;
    x *= k;
    y *= k;
    if (A < 0) x = -x;        // fix the signs dropped by llabs
    if (B < 0) y = -y;
    cout << x << " " << y << "\\n";
    return 0;
}`,
      explanation: [
        "Rewrite the line as A*x + B*y = -C, which is the plain Diophantine template. It has a lattice point exactly when gcd(A, B) divides C, and extended gcd scaled by (-C)/g produces one.",
        "Signs are the entire difficulty. Running extended gcd on negative inputs is unreliable because C++ integer division truncates toward zero, so the recursion's substitution step no longer matches the intended identity. Feed it |A| and |B| instead, which gives |A|*x + |B|*y = g, then negate x when A is negative and y when B is negative to recover A*x + B*y = g.",
        "The degenerate inputs fall out for free. If A = 0 then g = |B| and the code returns x = 0 with y = -C/B when divisible; the same holds with the roles swapped, so no special casing is required. Only A = B = 0 would break it, and the statement forbids it.",
        "Magnitudes need thought. Extended gcd returns |x| <= |B|/(2g) and the multiplier is |C|/g, so the product stays within roughly |B*C|/g^2 which is under 4*10^18 for the given limits and therefore fits in a signed 64-bit integer - but only just, so int is not an option.",
        "Time: O(log min(|A|, |B|)). Space: O(log min(|A|, |B|)).",
      ],
    },
    {
      name: "The Football Season (Codeforces 1244C)",
      difficulty: "Hard",
      variation: "Bounded search over the solution lattice",
      link: "https://codeforces.com/problemset/problem/1244/C",
      question: [
        "A team played n games and scored p points in total. A win is worth w points, a draw is worth d points, and a loss is worth 0 points, with d < w. Find any triple of non-negative integers (x, y, z) - wins, draws and losses - such that x + y + z = n and w*x + d*y = p. Print the triple, or -1 if no such triple exists.",
        "Example 1:\nInput: n = 30, p = 60, w = 3, d = 1\nOutput: 20 0 10\nExplanation: 3*20 + 1*0 = 60 points from 20 wins, and 20 + 0 + 10 = 30 games. Other valid answers such as '17 9 4' are equally accepted.",
        "Example 2:\nInput: n = 10, p = 51, w = 5, d = 4\nOutput: -1\nExplanation: ten games can yield at most 5*10 = 50 points, so 51 is out of reach.",
        "Constraints:\n- 1 <= n <= 10^12\n- 0 <= p <= 10^17\n- 1 <= d < w <= 10^5\n- any valid triple is accepted",
      ],
      code: `long long extgcd(long long a, long long b, long long &x, long long &y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long x1, y1;
    long long g = extgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}

long long modInverse(long long a, long long m) {
    if (m == 1) return 0;
    long long x, y;
    extgcd(a % m, m, x, y);
    return ((x % m) + m) % m;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long n, p, w, d;
    cin >> n >> p >> w >> d;
    long long g = std::gcd(w, d);
    if (p % g != 0) {
        cout << -1 << "\\n";
        return 0;
    }
    long long ww = w / g, dd = d / g, pp = p / g;
    // Solve d*y = p (mod w) for the smallest non-negative y.
    long long y = pp % ww * modInverse(dd, ww) % ww;
    long long rem = p - d * y;               // divisible by w by construction
    if (rem < 0) {
        cout << -1 << "\\n";
        return 0;
    }
    long long x = rem / w;
    if (x + y > n) {                         // not enough games played
        cout << -1 << "\\n";
        return 0;
    }
    cout << x << " " << y << " " << n - x - y << "\\n";
    return 0;
}`,
      explanation: [
        "The equation w*x + d*y = p is the Diophantine core; the extra constraint x + y <= n turns it into an optimisation over the solution lattice. Since a win is worth more than a draw, the triple that uses the fewest games is the one with the fewest draws, so minimising y over the non-negative solutions is exactly the right greedy objective - if the minimal-y solution does not fit in n games, none does.",
        "Minimising y is a congruence: reduce w*x + d*y = p modulo w to get d*y = p (mod w). Divide through by g = gcd(w, d) so that d/g becomes invertible modulo w/g, then y0 = (p/g) * inverse(d/g) mod (w/g) is the smallest non-negative draw count. Every other legal y is y0 plus a multiple of w/g, hence larger, and the matching x = (p - d*y0)/w is an integer by construction.",
        "Feasibility then needs two checks and both are easy to forget: rem = p - d*y0 must be non-negative (otherwise the point score is simply too small for any legal split), and x + y0 must not exceed n. The score-too-large case is caught by the second check, as in the 51-points-in-10-games example.",
        "The natural brute force is to loop y from 0 to w-1, exploiting the fact that w draws can be traded for d wins at equal cost. That is 10^5 iterations and passes here, but the congruence version is O(log w) and generalises to coefficients where a loop would not fit.",
        "Sizes stay safe: y0 < w/g <= 10^5 and d < 10^5, so d*y0 is below 10^10 and never overflows against p up to 10^17. The intermediate pp % ww * inverse is at most about 10^10, also fine in 64-bit.",
        "Time: O(log w). Space: O(log w).",
      ],
    },
  ],
};
