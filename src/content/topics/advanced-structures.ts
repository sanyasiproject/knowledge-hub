import type { TopicContent } from "../types";

export const advancedStructures: TopicContent = {
  quickSummary: [
    "Segment Trees support range queries (sum, min, max, GCD) and point or range updates in O(log n) time, using a complete binary tree stored in an array of size 4n.",
    "Fenwick Trees (Binary Indexed Trees) provide prefix sums and point updates in O(log n) with half the memory of a segment tree, leveraging the lowest set bit trick for index arithmetic.",
    "Disjoint Set Union (Union-Find) tracks a partition of elements into disjoint sets, supporting near-constant-time union and find operations via path compression and union by rank, achieving amortized O(alpha(n)) per operation where alpha is the inverse Ackermann function.",
    "These three structures are foundational in competitive programming, database indexing, network connectivity, and computational geometry, and appear frequently in system design and coding interviews.",
  ],
  detailed: [
    "A Segment Tree is a balanced binary tree where each leaf represents a single element of the input array and each internal node stores the aggregate (sum, minimum, maximum, etc.) of its children's ranges. Given an array of n elements, the tree is built in O(n) time, and both range queries and point updates run in O(log n). The tree is typically stored in a flat array of size 4n, where node i has children at 2i and 2i+1. This structure naturally extends to support lazy propagation for efficient range updates.",
    "A Fenwick Tree, also called a Binary Indexed Tree (BIT), is a more space-efficient alternative to a segment tree for problems that only require prefix queries (prefix sums, prefix XOR, etc.) and point updates. It uses exactly n+1 array slots and relies on bit manipulation of indices: the operation i & (-i) extracts the lowest set bit, which determines the range of responsibility of each node. Updates and queries both run in O(log n). While less general than segment trees, Fenwick trees have smaller constants, simpler code, and are often preferred when the problem fits their query model.",
    "The Disjoint Set Union (DSU), also known as Union-Find, maintains a collection of disjoint sets and supports two operations: find (determine which set an element belongs to) and union (merge two sets). The naive implementation uses a forest of trees where each node points to its parent. Two critical optimizations bring the amortized cost per operation down to O(alpha(n)): path compression (during find, make every visited node point directly to the root) and union by rank (attach the shorter tree under the root of the taller tree). DSU is essential for Kruskal's minimum spanning tree algorithm, detecting cycles in undirected graphs, and dynamic connectivity problems.",
    "These structures are not mutually exclusive. In many competitive programming problems, a segment tree might be augmented with a DSU, or a Fenwick tree might be used alongside other structures. Understanding when to pick each one is a key skill: use a segment tree when you need arbitrary range queries with range updates; use a Fenwick tree when prefix queries and point updates suffice; use DSU when you need to track connected components or equivalence classes dynamically.",
    "All three structures have important variants. Segment trees can be made persistent (preserving previous versions), dynamic (allocating nodes on demand for sparse ranges), or 2D. Fenwick trees extend to 2D for rectangle sum queries. DSU can be augmented with rollback (for offline divide-and-conquer), weighted edges (to track relative differences between elements), or small-to-large merging of auxiliary data.",
  ],
  deepDive: [
    "Lazy propagation in segment trees is the technique that enables O(log n) range updates instead of the naive O(n). Each internal node carries a 'lazy' tag representing a pending operation that has not yet been pushed to its children. When a range update covers a node's entire range, we update the node's aggregate value and store the operation in the lazy tag instead of recursing further. Before any query or update that needs to inspect a node's children, we first 'push down' the lazy tag: apply the pending operation to both children, transfer the tag to them, and clear the parent's tag. This push-down ensures correctness while deferring work until it is actually needed. The technique generalizes to any associative operation: range addition, range assignment, range XOR, and even composite operations where multiple lazy tags are combined using a composition function. Implementing lazy propagation correctly requires careful handling of tag composition (applying a new operation on top of an existing pending one) and ensuring push-down happens before every access to child nodes.",
    "Path compression in Union-Find is deceptively simple but profoundly effective. During a find(x) call, after locating the root r, we revisit every node on the path from x to r and point each one directly to r. This flattens the tree dramatically. With path compression alone (no union by rank), the amortized cost per operation is O(log n). When combined with union by rank, the amortized cost drops to O(alpha(n)), where alpha is the inverse Ackermann function, a function that grows so slowly it is effectively constant for all practical input sizes (alpha(n) <= 4 for n up to 2^65536). The formal proof of this bound, due to Tarjan, uses a potential function argument based on the rank structure of the forest. There are two common variants of path compression: full path compression (the classic version described above) and path splitting/path halving, where each node on the find path is made to skip one or two levels. All three achieve the same amortized bound.",
    "Union by rank maintains a rank value for each root, which is an upper bound on the height of its subtree. When uniting two sets, the root with the smaller rank is made a child of the root with the larger rank. If ranks are equal, one is chosen arbitrarily and its rank is incremented. This ensures that no tree ever exceeds height O(log n), even without path compression. An alternative heuristic, union by size, attaches the smaller set under the larger one and achieves the same asymptotic bound. In practice, union by size is sometimes preferred because the size value remains meaningful (it counts the set's elements), whereas rank becomes a loose upper bound after path compression distorts the tree shape.",
    "Segment trees support a powerful operation called 'merge' (also known as segment tree merging), which combines two segment trees that cover the same index range into one in time proportional to the total number of nodes across both trees. This is particularly useful in problems involving heavy-light decomposition on trees, where each vertex maintains its own segment tree and we merge segment trees when combining subtree information during DFS. The merge operation works by recursively merging corresponding nodes: if one tree lacks a node in a given range, we reuse the other tree's node directly. For dynamic (pointer-based) segment trees over a range of size R, each tree uses at most O(n log R) nodes, and the total work across all merges in a tree-DP scenario is bounded by O(n log R).",
    "The Fenwick tree's elegance lies in its index arithmetic. Consider a 1-indexed array. The value stored at index i is responsible for the sum of elements in the range [i - lowbit(i) + 1, i], where lowbit(i) = i & (-i). To compute a prefix sum up to index i, we accumulate tree[i] and then subtract the lowest set bit from i, repeating until i becomes 0. To update index i, we add the delta to tree[i] and then add the lowest set bit to i, repeating until i exceeds n. This works because the ranges of responsibility are arranged so that every prefix [1, i] is covered by exactly the set of nodes visited during the query traversal, and every point update propagates to exactly those nodes whose ranges include the updated index. A 2D Fenwick tree simply nests this structure: tree[i][j] is responsible for a rectangle of indices, and both queries and updates run in O(log n * log m) for an n x m grid.",
  ],
  code: [
    {
      language: "python",
      caption: "Segment Tree with range sum query and point update",
      source: `class SegmentTree:
    """Segment tree for range sum queries and point updates."""

    def __init__(self, data: list[int]):
        self.n = len(data)
        self.tree = [0] * (4 * self.n)
        if self.n > 0:
            self._build(data, 1, 0, self.n - 1)

    def _build(self, data, node, start, end):
        if start == end:
            self.tree[node] = data[start]
        else:
            mid = (start + end) // 2
            self._build(data, 2 * node, start, mid)
            self._build(data, 2 * node + 1, mid + 1, end)
            self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def update(self, idx: int, val: int):
        """Set data[idx] = val."""
        self._update(1, 0, self.n - 1, idx, val)

    def _update(self, node, start, end, idx, val):
        if start == end:
            self.tree[node] = val
        else:
            mid = (start + end) // 2
            if idx <= mid:
                self._update(2 * node, start, mid, idx, val)
            else:
                self._update(2 * node + 1, mid + 1, end, idx, val)
            self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def query(self, l: int, r: int) -> int:
        """Return sum of data[l..r] inclusive."""
        return self._query(1, 0, self.n - 1, l, r)

    def _query(self, node, start, end, l, r) -> int:
        if r < start or end < l:
            return 0  # identity for sum
        if l <= start and end <= r:
            return self.tree[node]
        mid = (start + end) // 2
        left_sum = self._query(2 * node, start, mid, l, r)
        right_sum = self._query(2 * node + 1, mid + 1, end, l, r)
        return left_sum + right_sum


# Usage
data = [1, 3, 5, 7, 9, 11]
st = SegmentTree(data)
print(st.query(1, 3))  # 3 + 5 + 7 = 15
st.update(2, 10)        # data becomes [1, 3, 10, 7, 9, 11]
print(st.query(1, 3))  # 3 + 10 + 7 = 20`,
    },
    {
      language: "python",
      caption: "Fenwick Tree (Binary Indexed Tree) for prefix sums",
      source: `class FenwickTree:
    """Binary Indexed Tree for prefix sum queries and point updates.

    Uses 1-based indexing internally. The key insight is that
    i & (-i) isolates the lowest set bit of i, which determines
    the range of indices each position is responsible for.
    """

    def __init__(self, n: int):
        self.n = n
        self.tree = [0] * (n + 1)

    @classmethod
    def from_array(cls, data: list[int]) -> "FenwickTree":
        """Build a Fenwick tree from an existing array in O(n)."""
        ft = cls(len(data))
        for i, val in enumerate(data):
            ft.tree[i + 1] = val
        for i in range(1, ft.n + 1):
            parent = i + (i & -i)
            if parent <= ft.n:
                ft.tree[parent] += ft.tree[i]
        return ft

    def update(self, i: int, delta: int):
        """Add delta to element at 1-based index i."""
        while i <= self.n:
            self.tree[i] += delta
            i += i & (-i)  # move to next responsible ancestor

    def prefix_sum(self, i: int) -> int:
        """Return sum of elements [1..i] (1-based)."""
        total = 0
        while i > 0:
            total += self.tree[i]
            i -= i & (-i)  # strip lowest set bit
        return total

    def range_sum(self, l: int, r: int) -> int:
        """Return sum of elements [l..r] (1-based, inclusive)."""
        return self.prefix_sum(r) - self.prefix_sum(l - 1)


# Usage
data = [1, 3, 5, 7, 9, 11]
ft = FenwickTree.from_array(data)
print(ft.range_sum(2, 4))  # 3 + 5 + 7 = 15
ft.update(3, 5)            # data[3] becomes 5+5=10
print(ft.range_sum(2, 4))  # 3 + 10 + 7 = 20`,
    },
    {
      language: "python",
      caption: "Union-Find (Disjoint Set Union) with path compression and union by rank",
      source: `class UnionFind:
    """Disjoint Set Union with path compression and union by rank.

    Amortized O(alpha(n)) per operation, where alpha is the
    inverse Ackermann function (effectively constant).
    """

    def __init__(self, n: int):
        self.parent = list(range(n))
        self.rank = [0] * n
        self.set_count = n  # number of disjoint sets

    def find(self, x: int) -> int:
        """Find the root of x with full path compression."""
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # path compression
        return self.parent[x]

    def union(self, x: int, y: int) -> bool:
        """Merge sets containing x and y. Returns False if already same set."""
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return False
        # Union by rank: attach shorter tree under taller tree
        if self.rank[rx] < self.rank[ry]:
            rx, ry = ry, rx
        self.parent[ry] = rx
        if self.rank[rx] == self.rank[ry]:
            self.rank[rx] += 1
        self.set_count -= 1
        return True

    def connected(self, x: int, y: int) -> bool:
        """Check if x and y are in the same set."""
        return self.find(x) == self.find(y)


# Usage: detect if adding an edge creates a cycle
edges = [(0, 1), (1, 2), (2, 3), (3, 1)]  # last edge creates cycle
uf = UnionFind(4)
for u, v in edges:
    if not uf.union(u, v):
        print(f"Edge ({u}, {v}) creates a cycle!")
    else:
        print(f"Edge ({u}, {v}) merged sets. Sets remaining: {uf.set_count}")

# Output:
# Edge (0, 1) merged sets. Sets remaining: 3
# Edge (1, 2) merged sets. Sets remaining: 2
# Edge (2, 3) merged sets. Sets remaining: 1
# Edge (3, 1) creates a cycle!`,
    },
  ],
  diagrams: [
    {
      title: "Segment Tree Structure",
      kind: "architecture",
      caption:
        "A segment tree for array [1, 3, 5, 7] shown as a binary tree. Each internal node stores the sum of its subtree. Leaves correspond to individual array elements; internal nodes aggregate their children's ranges.",
    },
    {
      title: "Fenwick Tree Index Responsibilities",
      kind: "architecture",
      caption:
        "Visualization of how each Fenwick tree index covers a range determined by its lowest set bit. Index 8 (binary 1000) covers indices 1-8, index 6 (binary 0110) covers indices 5-6, and index 5 (binary 0101) covers only index 5.",
    },
    {
      title: "Union-Find Path Compression",
      kind: "flow",
      caption:
        "Before and after path compression on find(5): the chain 5->4->3->2->1->0 becomes a flat star where 5, 4, 3, 2, 1 all point directly to root 0.",
    },
    {
      title: "Lazy Propagation Push-Down",
      kind: "sequence",
      caption:
        "Sequence diagram showing how a range update stores a lazy tag at a covering node, and a subsequent query triggers push-down of the tag to children before accessing them.",
    },
  ],
  animations: [
    {
      title: "Building a Segment Tree",
      steps: [
        {
          label: "Initialize leaves",
          detail:
            "Place each array element at a leaf node. For array [2, 1, 5, 3], leaves are at tree positions 4, 5, 6, 7 (for 1-indexed, size-8 tree).",
        },
        {
          label: "Compute level 2 (parents of leaves)",
          detail:
            "tree[3] = tree[6] + tree[7] = 5 + 3 = 8. tree[2] = tree[4] + tree[5] = 2 + 1 = 3.",
        },
        {
          label: "Compute root",
          detail:
            "tree[1] = tree[2] + tree[3] = 3 + 8 = 11. The root now holds the total sum of the entire array.",
        },
        {
          label: "Tree is ready",
          detail:
            "The segment tree is fully built in O(n). Any range query [l, r] can now be answered in O(log n) by decomposing the range into at most 2*log(n) tree nodes.",
        },
      ],
    },
    {
      title: "Union-Find: Union by Rank and Path Compression",
      steps: [
        {
          label: "Initial state",
          detail:
            "Five elements {0, 1, 2, 3, 4}, each in its own set. parent = [0, 1, 2, 3, 4], rank = [0, 0, 0, 0, 0].",
        },
        {
          label: "union(0, 1)",
          detail:
            "Both have rank 0. Attach 1 under 0, increment rank of 0. parent = [0, 0, 2, 3, 4], rank = [1, 0, 0, 0, 0].",
        },
        {
          label: "union(2, 3)",
          detail:
            "Both rank 0. Attach 3 under 2. parent = [0, 0, 2, 2, 4], rank = [1, 0, 1, 0, 0].",
        },
        {
          label: "union(1, 3)",
          detail:
            "find(1) = 0 (rank 1), find(3) = 2 (rank 1). Equal ranks: attach 2 under 0, increment rank of 0 to 2. parent = [0, 0, 0, 2, 4], rank = [2, 0, 1, 0, 0].",
        },
        {
          label: "find(3) with path compression",
          detail:
            "Traversal: 3 -> 2 -> 0 (root). Path compression flattens: parent[3] = 0, parent[2] = 0. Future finds for 3 are O(1).",
        },
      ],
    },
    {
      title: "Fenwick Tree Prefix Sum Query",
      steps: [
        {
          label: "Query prefix_sum(7)",
          detail:
            "Start at index 7 (binary 0111). Accumulate tree[7].",
        },
        {
          label: "Strip lowest set bit: 7 -> 6",
          detail:
            "7 & (-7) = 1, so 7 - 1 = 6. Accumulate tree[6]. Index 6 (binary 0110) covers range [5, 6].",
        },
        {
          label: "Strip lowest set bit: 6 -> 4",
          detail:
            "6 & (-6) = 2, so 6 - 2 = 4. Accumulate tree[4]. Index 4 (binary 0100) covers range [1, 4].",
        },
        {
          label: "Strip lowest set bit: 4 -> 0",
          detail:
            "4 & (-4) = 4, so 4 - 4 = 0. Stop. Total = tree[7] + tree[6] + tree[4], which equals the prefix sum of elements [1..7].",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Feature",
      "Segment Tree",
      "Fenwick Tree (BIT)",
      "Sparse Table",
      "Sqrt Decomposition",
    ],
    rows: [
      [
        "Build time",
        "O(n)",
        "O(n)",
        "O(n log n)",
        "O(n)",
      ],
      [
        "Point update",
        "O(log n)",
        "O(log n)",
        "O(n log n) rebuild",
        "O(sqrt(n))",
      ],
      [
        "Range query",
        "O(log n)",
        "O(log n) via prefix diff",
        "O(1)",
        "O(sqrt(n))",
      ],
      [
        "Range update",
        "O(log n) with lazy propagation",
        "O(log n) with range trick",
        "Not supported",
        "O(sqrt(n))",
      ],
      [
        "Space",
        "O(4n)",
        "O(n)",
        "O(n log n)",
        "O(n)",
      ],
      [
        "Supports non-idempotent ops (e.g., sum)",
        "Yes",
        "Yes",
        "No (idempotent only: min, max, GCD)",
        "Yes",
      ],
      [
        "Implementation complexity",
        "Medium-High",
        "Low",
        "Low",
        "Low",
      ],
      [
        "Best use case",
        "General range queries + updates, lazy propagation problems",
        "Prefix sums, point updates, inversions counting",
        "Static arrays, range min/max with no updates",
        "Simple problems, Mo's algorithm, when constant factor matters",
      ],
    ],
  },
  interviewQA: [
    {
      q: "Explain how a segment tree answers a range sum query in O(log n).",
      a: "Starting from the root, at each node we check if the node's range is entirely within the query range (return its stored value), entirely outside (return 0), or partially overlapping (recurse into both children and sum their results). Since the tree has O(log n) levels, and at each level we visit at most 2 nodes that partially overlap the query boundaries (one on the left boundary, one on the right), the total work is O(log n).",
      followUps: [
        "How would you modify this for range minimum queries? (Replace sum with min, and return infinity for out-of-range nodes.)",
        "What changes if we need range updates instead of point updates? (Add lazy propagation.)",
      ],
    },
    {
      q: "What is lazy propagation and when do you need it?",
      a: "Lazy propagation defers range updates by storing pending operations at internal nodes instead of immediately propagating to all affected leaves. When a later query or update needs to access a node's children, the pending operation is 'pushed down' first. This allows range updates in O(log n) instead of O(n). You need it whenever the problem requires both range queries and range updates, such as 'add value v to all elements in [l, r]' combined with 'query sum of [l, r]'.",
      followUps: [
        "How do you handle composing multiple pending lazy updates? (Define a composition function for the lazy tags; e.g., for range add, new_lazy = old_lazy + delta.)",
        "Can lazy propagation handle range assignment and range addition simultaneously? (Yes, by using a composite lazy tag with both fields and a careful composition rule.)",
      ],
    },
    {
      q: "Why does path compression in Union-Find not always give O(1) per find?",
      a: "Path compression flattens the tree for the specific path traversed, but other paths may remain deep until they are themselves traversed. The amortized bound of O(alpha(n)) per operation accounts for the fact that while individual operations can take O(log n) in the worst case, the total cost across any sequence of m operations is O(m * alpha(n)). True O(1) worst-case is not achievable, but alpha(n) <= 4 for any practically conceivable input size.",
      followUps: [
        "What is the inverse Ackermann function? (It is the functional inverse of the Ackermann function, which grows faster than any primitive recursive function. Its inverse grows so slowly that alpha(n) <= 4 for n up to 2^65536.)",
        "Can you achieve the same bound with path halving instead of full path compression? (Yes, both achieve O(alpha(n)) amortized.)",
      ],
    },
    {
      q: "When would you choose a Fenwick tree over a segment tree?",
      a: "Choose a Fenwick tree when the problem only requires prefix-decomposable queries (e.g., prefix sums, where range [l, r] = prefix(r) - prefix(l-1)) and point updates. Fenwick trees use half the memory (n+1 vs 4n), have smaller constants due to simpler operations and better cache behavior, and are significantly shorter to implement. However, if you need non-prefix-decomposable operations (like range minimum), range updates with lazy propagation, or the ability to walk the tree structure, a segment tree is necessary.",
      followUps: [
        "Can a Fenwick tree support range updates and point queries? (Yes, by storing differences: a range update [l, r] += v becomes update(l, +v) and update(r+1, -v), and a point query is a prefix sum.)",
        "How do you extend a Fenwick tree to 2D? (Nest the structure: tree[i][j] uses lowbit operations on both indices, giving O(log n * log m) per operation.)",
      ],
    },
    {
      q: "How is Union-Find used in Kruskal's minimum spanning tree algorithm?",
      a: "Kruskal's algorithm sorts all edges by weight and processes them in order. For each edge (u, v), we use find(u) and find(v) to check if u and v are in the same connected component. If they are (same root), adding this edge would create a cycle, so we skip it. If they are in different components, we include the edge in the MST and call union(u, v) to merge their components. With path compression and union by rank, each union/find is O(alpha(n)), so the total time for the Union-Find operations across all E edges is O(E * alpha(V)), making the sort (O(E log E)) the bottleneck.",
      followUps: [
        "How would you find the MST if edges arrive online? (Use link-cut trees for a fully dynamic MST, or batch with offline DSU with rollback.)",
        "What is the time complexity of Kruskal's overall? (O(E log E) due to sorting, since E * alpha(V) is dominated by the sort.)",
      ],
    },
    {
      q: "How do you count inversions in an array using a Fenwick tree?",
      a: "Process the array from right to left (or left to right with coordinate compression). For each element a[i], query the Fenwick tree for the prefix sum up to a[i]-1, which counts how many previously processed elements are smaller (i.e., elements to the right that are smaller, forming inversions). Then update the Fenwick tree at index a[i]. The total inversion count is the sum of all queries. With coordinate compression to map values to [1, n], this runs in O(n log n) time and O(n) space.",
      followUps: [
        "Can you solve this with a segment tree instead? (Yes, with the same approach and complexity.)",
        "What about using merge sort? (Yes, merge sort counts inversions during the merge step, also in O(n log n).)",
      ],
    },
  ],
  followUps: [
    "Lazy propagation for range updates on segment trees",
    "Persistent segment trees and their applications in competitive programming",
    "Heavy-light decomposition with segment trees for tree path queries",
    "Mo's algorithm with sqrt decomposition for offline range queries",
    "Merge sort trees and fractional cascading",
    "Weighted Union-Find for tracking relative values between elements",
    "2D Fenwick trees for rectangle sum queries",
    "Euler tour technique combined with segment trees for subtree queries",
  ],
  mcqs: [
    {
      q: "What is the space complexity of a standard segment tree for an array of size n?",
      options: ["O(n)", "O(2n)", "O(4n)", "O(n log n)"],
      answerIndex: 2,
      explanation:
        "A segment tree requires an array of size 4n to safely store all nodes. While the theoretical number of nodes in a complete binary tree with n leaves is 2n-1, using 4n avoids off-by-one issues when n is not a power of 2.",
    },
    {
      q: "In a Fenwick tree, the operation i & (-i) computes:",
      options: [
        "The parent index of node i",
        "The lowest set bit of i",
        "The sibling index of node i",
        "The depth of node i in the tree",
      ],
      answerIndex: 1,
      explanation:
        "The expression i & (-i) isolates the lowest set bit of i. In two's complement representation, -i flips all bits and adds 1, so ANDing with i yields only the rightmost 1-bit. This value determines the range of indices that position i is responsible for in the Fenwick tree.",
    },
    {
      q: "What is the amortized time complexity per operation of Union-Find with both path compression and union by rank?",
      options: ["O(1)", "O(log n)", "O(log* n)", "O(alpha(n))"],
      answerIndex: 3,
      explanation:
        "With both optimizations, each operation takes amortized O(alpha(n)) time, where alpha is the inverse Ackermann function. This function grows so slowly (alpha(n) <= 4 for all practical n) that it is effectively constant, but it is not truly O(1).",
    },
    {
      q: "Which data structure supports O(1) range minimum queries on a static array?",
      options: [
        "Segment Tree",
        "Fenwick Tree",
        "Sparse Table",
        "Union-Find",
      ],
      answerIndex: 2,
      explanation:
        "A Sparse Table preprocesses the array in O(n log n) time and space, then answers range minimum (or maximum, GCD) queries in O(1) using the overlap-friendly property of idempotent operations. Segment trees achieve O(log n) per query, and Fenwick trees do not directly support range minimum.",
    },
    {
      q: "Lazy propagation in a segment tree is necessary when:",
      options: [
        "The array contains negative numbers",
        "You need range queries but only point updates",
        "You need both range queries and range updates in O(log n)",
        "The array size exceeds 10^6",
      ],
      answerIndex: 2,
      explanation:
        "Lazy propagation is needed when the problem requires range updates (updating all elements in an interval) alongside range queries. Without lazy propagation, a range update touching k leaves costs O(k), which can be O(n). Lazy propagation defers the update, keeping both operations at O(log n).",
    },
    {
      q: "In Union-Find, what does 'union by rank' guarantee?",
      options: [
        "The tree height never exceeds O(log n)",
        "Every find operation takes O(1)",
        "The root always has the largest value",
        "Sets are always stored in sorted order",
      ],
      answerIndex: 0,
      explanation:
        "Union by rank attaches the shorter tree under the taller one, ensuring the height of any tree never exceeds O(log n). This alone gives O(log n) per find. Combined with path compression, the amortized cost drops to O(alpha(n)).",
    },
    {
      q: "A Fenwick tree CANNOT directly support which of the following?",
      options: [
        "Point updates",
        "Prefix sum queries",
        "Range minimum queries",
        "Range sum queries via prefix difference",
      ],
      answerIndex: 2,
      explanation:
        "Fenwick trees rely on the prefix-decomposable property: range [l, r] = prefix(r) - prefix(l-1). This works for sums and XOR but not for minimum/maximum, because min is not invertible (you cannot 'subtract' a minimum). Range minimum requires a segment tree or sparse table.",
    },
  ],
  exercises: [
    "Implement a segment tree that supports both range addition updates (add v to all elements in [l, r]) and range sum queries using lazy propagation.",
    "Given an array of n integers, use a Fenwick tree to count the number of inversions (pairs (i, j) where i < j but a[i] > a[j]) in O(n log n).",
    "Implement Union-Find with path compression and union by rank, then use it to determine if an undirected graph is connected given its edge list.",
    "Build a segment tree that supports range minimum queries and point updates. Use it to answer queries of the form 'what is the minimum value in [l, r]?'.",
    "Implement a 2D Fenwick tree that supports point updates and rectangle sum queries on an m x n grid.",
    "Using Union-Find, implement Kruskal's algorithm to find the minimum spanning tree of a weighted undirected graph.",
    "Extend Union-Find with a 'size' array to support union by size instead of union by rank. Implement a method that returns the size of the set containing a given element.",
    "Implement a persistent segment tree that allows querying any previous version of the array after point updates.",
  ],
  flashcards: [
    {
      front: "What is the time complexity of building a segment tree?",
      back: "O(n). Each of the O(n) internal nodes is computed once by summing its two children, bottom-up.",
    },
    {
      front: "How does i & (-i) work in a Fenwick tree?",
      back: "It isolates the lowest set bit of i. In two's complement, -i = ~i + 1, so i & (-i) yields only the rightmost 1-bit. This determines the range of responsibility of index i.",
    },
    {
      front: "What is path compression in Union-Find?",
      back: "During find(x), after finding the root r, every node on the path from x to r is re-pointed directly to r. This flattens the tree so future finds are faster.",
    },
    {
      front: "What is the inverse Ackermann function alpha(n)?",
      back: "The functional inverse of the Ackermann function. It grows incredibly slowly: alpha(n) <= 4 for all n up to 2^65536. It appears in the amortized complexity of Union-Find with path compression and union by rank.",
    },
    {
      front: "What is lazy propagation?",
      back: "A technique where range updates are stored as pending tags at segment tree nodes instead of being immediately applied to all descendants. Tags are pushed down to children only when those children are accessed by a query or update.",
    },
    {
      front: "When should you use a Fenwick tree instead of a segment tree?",
      back: "When you only need prefix-decomposable queries (like prefix sums) and point updates. Fenwick trees use less memory (n+1 vs 4n), have smaller constants, and are simpler to implement.",
    },
    {
      front: "What is union by rank?",
      back: "An optimization for Union-Find where the tree with smaller rank (upper bound on height) is attached under the root of the tree with larger rank. If ranks are equal, one is chosen and its rank is incremented. This keeps tree height O(log n).",
    },
    {
      front: "Why can't a Fenwick tree compute range minimum queries?",
      back: "Range minimum is not prefix-decomposable: min(l, r) cannot be computed from min(1, r) and min(1, l-1) because min has no inverse operation. Fenwick trees rely on inverting prefix aggregates (e.g., prefix(r) - prefix(l-1) for sums).",
    },
    {
      front: "What is the space complexity of a sparse table?",
      back: "O(n log n). It precomputes answers for all ranges of length 2^k for k = 0, 1, ..., floor(log n), requiring n entries per level and O(log n) levels.",
    },
    {
      front: "How does segment tree merging work?",
      back: "Two segment trees over the same index range are merged recursively: at each node, if one tree has no node for a sub-range, the other's node is reused directly. Total work across all merges in tree-DP problems is O(n log R) where R is the index range.",
    },
  ],
  revisionNotes: [
    "Segment tree: array of size 4n, node i has children 2i and 2i+1. Build O(n), query O(log n), update O(log n). Works for any associative operation (sum, min, max, GCD, XOR).",
    "Fenwick tree: array of size n+1, 1-indexed. lowbit(i) = i & (-i). Query walks i -= lowbit(i) down to 0. Update walks i += lowbit(i) up to n. Only for prefix-decomposable operations.",
    "Union-Find: parent[] and rank[] arrays. find() with path compression: recursively set parent to root. union() with rank: attach smaller-rank root under larger-rank root. Amortized O(alpha(n)).",
    "Lazy propagation: store pending updates as tags. Push down before accessing children. Tag composition must be defined (e.g., for range add: compose by addition). Enables O(log n) range updates.",
    "Sparse table: O(n log n) build, O(1) query, but only for idempotent operations (min, max, GCD) and static arrays. Cannot handle updates.",
    "Sqrt decomposition: split array into blocks of size sqrt(n). Both queries and updates are O(sqrt(n)). Simple to implement, good for offline algorithms like Mo's algorithm.",
    "Key insight for interviews: Fenwick tree = simple + fast for prefix sums. Segment tree = flexible + general. Sparse table = fastest queries but no updates. Union-Find = dynamic connectivity.",
    "Common mistake: forgetting to push down lazy tags before recursing into children. This leads to stale values and incorrect query results.",
  ],
  cheatSheet: [
    "Segment Tree build: recursively split [l, r] at mid = (l+r)/2, node = left_child + right_child",
    "Segment Tree query(l, r): if node range inside query -> return value; if outside -> return identity; else recurse both children",
    "Segment Tree update(idx, val): recurse to leaf, set value, propagate up recalculating parent = left + right",
    "Fenwick query(i): total = 0; while i > 0: total += tree[i], i -= i & (-i); return total",
    "Fenwick update(i, delta): while i <= n: tree[i] += delta, i += i & (-i)",
    "Fenwick range sum [l, r] = prefix(r) - prefix(l - 1)",
    "Union-Find find(x): if parent[x] != x: parent[x] = find(parent[x]); return parent[x]",
    "Union-Find union(x, y): rx = find(x), ry = find(y); if rank[rx] < rank[ry]: swap; parent[ry] = rx; if rank equal: rank[rx]++",
    "Lazy push-down: apply pending op to both children, transfer tag to children, clear parent tag",
    "Fenwick tree from array in O(n): fill tree[i] = a[i], then for i=1..n: parent = i + (i & -i); if parent <= n: tree[parent] += tree[i]",
    "2D Fenwick: nest the lowbit loop — outer loop on x index, inner loop on y index",
    "Union-Find cycle detection: if find(u) == find(v) before union, edge (u,v) creates a cycle",
  ],
  resources: [
    {
      label: "Competitive Programmer's Handbook by Antti Laaksonen",
      kind: "book",
      note: "Chapters on segment trees, Fenwick trees, and Union-Find with clear explanations and contest-style examples.",
    },
    {
      label: "CP-Algorithms: Segment Tree",
      kind: "article",
      note: "Comprehensive reference covering basic segment trees, lazy propagation, persistent segment trees, and segment tree beats.",
    },
    {
      label: "CP-Algorithms: Fenwick Tree",
      kind: "article",
      note: "Detailed tutorial on BIT operations, range update variants, and multidimensional extensions.",
    },
    {
      label: "CP-Algorithms: Disjoint Set Union",
      kind: "article",
      note: "Covers path compression, union by rank/size, DSU with rollback, and applications in graph algorithms.",
    },
    {
      label: "MIT 6.851 Advanced Data Structures (Erik Demaine)",
      kind: "video",
      note: "Lecture series covering persistent data structures, segment tree merging, and amortized analysis of Union-Find.",
    },
    {
      label: "Introduction to Algorithms (CLRS), Chapter 21: Data Structures for Disjoint Sets",
      kind: "book",
      note: "Rigorous treatment of Union-Find with the inverse Ackermann amortized analysis proof.",
    },
    {
      label: "Codeforces EDU: Segment Tree",
      kind: "article",
      note: "Interactive problem set with step-by-step segment tree problems ranging from basic to advanced (lazy propagation, beats).",
    },
    {
      label: "William Fiset - Data Structures Playlist (YouTube)",
      kind: "video",
      note: "Visual explanations of Fenwick trees and Union-Find with animated walkthroughs of operations.",
    },
  ],
  glossary: [
    {
      term: "Segment Tree",
      definition:
        "A binary tree data structure where each node represents an interval of the array, enabling efficient range queries and updates in O(log n) time.",
    },
    {
      term: "Fenwick Tree (Binary Indexed Tree / BIT)",
      definition:
        "A compact data structure that supports prefix sum queries and point updates in O(log n) using bit manipulation on indices.",
    },
    {
      term: "Disjoint Set Union (DSU / Union-Find)",
      definition:
        "A data structure that maintains a partition of elements into disjoint sets, supporting near-constant-time union and find operations.",
    },
    {
      term: "Path Compression",
      definition:
        "An optimization for Union-Find where every node visited during find() is re-pointed directly to the root, flattening the tree for future operations.",
    },
    {
      term: "Union by Rank",
      definition:
        "An optimization for Union-Find where the tree with smaller rank (height upper bound) is attached under the tree with larger rank during a union operation.",
    },
    {
      term: "Lazy Propagation",
      definition:
        "A technique for segment trees where range updates are stored as pending tags at nodes and only pushed to children when those children are accessed.",
    },
    {
      term: "Inverse Ackermann Function (alpha)",
      definition:
        "An extremely slowly growing function that arises in the amortized analysis of Union-Find. alpha(n) <= 4 for all n up to 2^65536.",
    },
    {
      term: "Sparse Table",
      definition:
        "A data structure for static arrays that answers range queries on idempotent operations (min, max, GCD) in O(1) after O(n log n) preprocessing.",
    },
    {
      term: "Sqrt Decomposition",
      definition:
        "A technique that divides an array into blocks of size sqrt(n), enabling O(sqrt(n)) range queries and updates with simple implementation.",
    },
    {
      term: "Idempotent Operation",
      definition:
        "An operation where applying it multiple times gives the same result as applying it once (e.g., min, max, GCD). Required for sparse table O(1) queries because overlapping ranges do not cause double-counting.",
    },
    {
      term: "Prefix-Decomposable",
      definition:
        "A property of an operation where the result for any range [l, r] can be derived from prefix results: f(l, r) = f(1, r) 'minus' f(1, l-1). Sum and XOR are prefix-decomposable; min and max are not.",
    },
    {
      term: "Persistent Data Structure",
      definition:
        "A data structure that preserves previous versions of itself when modified, allowing queries on any historical state. Persistent segment trees create O(log n) new nodes per update.",
    },
  ],
};
