import type { TopicContent } from "../types";

export const balancedTrees: TopicContent = {
  quickSummary: [
    "Balanced BSTs (AVL, Red-Black, B-Trees) guarantee O(log n) search, insert, and delete by constraining how skewed the tree can become after mutations.",
    "AVL trees enforce a strict balance factor (height difference between subtrees <= 1), producing shorter trees but requiring more rotations on insert/delete.",
    "Red-Black trees relax the balance invariant (no path is more than twice as long as any other), yielding fewer rotations per mutation at the cost of slightly taller trees.",
    "B-Trees generalize to multi-way branching for disk/page-oriented storage, forming the backbone of virtually all database indexes and filesystems.",
  ],
  detailed: [
    "A binary search tree (BST) gives O(log n) operations only when it is roughly balanced. Without guarantees, inserting sorted data degrades a plain BST to a linked list with O(n) operations. Self-balancing BSTs solve this by performing local restructuring (rotations or recolorings) after each mutation to restore a height invariant.",
    "AVL trees, invented by Adelson-Velsky and Landis in 1962, were the first self-balancing BST. Every node stores a balance factor (height of left subtree minus height of right subtree), and the invariant requires this factor to be in {-1, 0, 1}. When an insertion or deletion violates the invariant, one or two rotations restore it. Because the invariant is strict, AVL trees are at most ~1.44 log2(n+2) tall, making lookups very fast.",
    "Red-Black trees, formalized by Guibas and Sedgewick in 1978, assign each node a color (red or black) and enforce five properties: (1) every node is red or black, (2) the root is black, (3) every null leaf is black, (4) red nodes have only black children, (5) all root-to-null paths have the same black-height. These properties ensure the longest path is at most twice the shortest, yielding O(log n) height. Red-Black trees require at most two rotations per insert and three per delete, making them popular in standard libraries (e.g., std::map in C++, TreeMap in Java).",
    "B-Trees (Bayer and McCreight, 1970) are balanced multi-way search trees designed for systems where reading a page of data is far more expensive than comparing keys in memory. A B-Tree of order m allows each node to hold up to m-1 keys and m children. Splits and merges keep every non-root node at least half full, guaranteeing O(log_m n) height. B+ Trees, a variant where all values live in the leaves linked in a chain, are the de facto standard for relational database indexes.",
    "Choosing among these structures depends on the workload: AVL trees for read-heavy in-memory use, Red-Black trees for mixed read/write in-memory use (especially in library implementations), and B/B+ Trees when data resides on disk or in paged memory. Newer structures like Left-Leaning Red-Black Trees (LLRB) and AA-Trees simplify implementation at the cost of slightly more rotations.",
  ],
  deepDive: [
    "The height of an AVL tree with n nodes satisfies h < 1.4405 log2(n+2) - 0.3277. This follows from the fact that the minimum number of nodes in an AVL tree of height h is the Fibonacci-like recurrence N(h) = N(h-1) + N(h-2) + 1, with N(0)=1 and N(1)=2. AVL insertions require at most one single or double rotation (O(1) restructuring work after the O(log n) walk), but deletions can propagate rotations all the way up the tree, causing O(log n) rotations in the worst case. This is why AVL trees slightly favor read-heavy workloads.",
    "Red-Black trees can be understood as an isometry of 2-3-4 trees (order-4 B-Trees). A red node together with its black parent corresponds to a 3-node or 4-node in a 2-3-4 tree. This insight, due to Sedgewick, simplifies reasoning about the balancing operations: a color flip corresponds to splitting a 4-node, and a rotation corresponds to redistributing a temporarily-unbalanced node. The black-height of a Red-Black tree is at most log2(n+1), and the total height is at most 2 log2(n+1). Insertion uses at most 2 rotations (though potentially O(log n) recolorings), while deletion uses at most 3 rotations.",
    "B-Tree analysis centers on minimizing disk I/O. With a branching factor m chosen so that one node fits in a single disk page (typically 4-16 KB), a B-Tree of order 1000 holding one billion keys is only about 3 levels deep, meaning any key lookup requires at most 3 page reads. Insertions that cause a node to overflow trigger a split that pushes the median key up; in the worst case, splits cascade to the root, increasing tree height by one. Bulk-loading a B-Tree bottom-up (sorting the data first, then building leaves left to right) produces a more compact tree and avoids random I/O during construction.",
    "Concurrent access is a critical concern for balanced trees in production systems. B-Trees benefit from lock-coupling (crabbing): acquire a lock on the child before releasing the parent, and release early if the child cannot split/merge. Blink-Trees (Lehman-Yao) add right-sibling pointers to allow lock-free traversal past concurrent splits. For in-memory concurrent use, lock-free Red-Black trees exist but are notoriously complex; practical systems often use skip lists or concurrent hash maps instead.",
    "Augmented balanced trees extend these structures for richer queries. An order-statistic tree stores subtree sizes to answer 'find the k-th smallest element' in O(log n). Interval trees (typically augmented Red-Black trees) answer 'find all intervals overlapping a query point' in O(log n + k). Range trees provide multi-dimensional orthogonal range queries. These augmentations work on any balanced BST because the rotation/recoloring operations can cheaply maintain the extra metadata.",
  ],
  code: [
    {
      language: "python",
      caption: "AVL Tree insertion with rotations",
      source: `class AVLNode:
    __slots__ = ('key', 'left', 'right', 'height')
    def __init__(self, key):
        self.key = key
        self.left = self.right = None
        self.height = 1

def height(node):
    return node.height if node else 0

def balance_factor(node):
    return height(node.left) - height(node.right) if node else 0

def update_height(node):
    node.height = 1 + max(height(node.left), height(node.right))

def rotate_right(y):
    x = y.left
    t2 = x.right
    x.right = y
    y.left = t2
    update_height(y)
    update_height(x)
    return x          # x is new root of subtree

def rotate_left(x):
    y = x.right
    t2 = y.left
    y.left = x
    x.right = t2
    update_height(x)
    update_height(y)
    return y

def avl_insert(root, key):
    if not root:
        return AVLNode(key)
    if key < root.key:
        root.left = avl_insert(root.left, key)
    elif key > root.key:
        root.right = avl_insert(root.right, key)
    else:
        return root   # duplicate keys not allowed

    update_height(root)
    bf = balance_factor(root)

    # Left-Left case
    if bf > 1 and key < root.left.key:
        return rotate_right(root)
    # Right-Right case
    if bf < -1 and key > root.right.key:
        return rotate_left(root)
    # Left-Right case
    if bf > 1 and key > root.left.key:
        root.left = rotate_left(root.left)
        return rotate_right(root)
    # Right-Left case
    if bf < -1 and key < root.right.key:
        root.right = rotate_right(root.right)
        return rotate_left(root)

    return root`,
    },
    {
      language: "python",
      caption: "Red-Black Tree insertion (simplified)",
      source: `RED, BLACK = True, False

class RBNode:
    __slots__ = ('key', 'color', 'left', 'right', 'parent')
    def __init__(self, key, color=RED):
        self.key = key
        self.color = color
        self.left = self.right = self.parent = None

class RedBlackTree:
    def __init__(self):
        self.NIL = RBNode(key=None, color=BLACK)
        self.root = self.NIL

    def _rotate_left(self, x):
        y = x.right
        x.right = y.left
        if y.left != self.NIL:
            y.left.parent = x
        y.parent = x.parent
        if x.parent is None:
            self.root = y
        elif x == x.parent.left:
            x.parent.left = y
        else:
            x.parent.right = y
        y.left = x
        x.parent = y

    def _rotate_right(self, y):
        x = y.left
        y.left = x.right
        if x.right != self.NIL:
            x.right.parent = y
        x.parent = y.parent
        if y.parent is None:
            self.root = x
        elif y == y.parent.right:
            y.parent.right = x
        else:
            y.parent.left = x
        x.right = y
        y.parent = x

    def insert(self, key):
        z = RBNode(key)
        z.left = z.right = self.NIL
        y, x = None, self.root
        while x != self.NIL:
            y = x
            x = x.left if z.key < x.key else x.right
        z.parent = y
        if y is None:
            self.root = z
        elif z.key < y.key:
            y.left = z
        else:
            y.right = z
        self._fix_insert(z)

    def _fix_insert(self, z):
        while z.parent and z.parent.color == RED:
            if z.parent == z.parent.parent.left:
                uncle = z.parent.parent.right
                if uncle.color == RED:        # Case 1: recolor
                    z.parent.color = BLACK
                    uncle.color = BLACK
                    z.parent.parent.color = RED
                    z = z.parent.parent
                else:
                    if z == z.parent.right:   # Case 2: triangle
                        z = z.parent
                        self._rotate_left(z)
                    z.parent.color = BLACK    # Case 3: line
                    z.parent.parent.color = RED
                    self._rotate_right(z.parent.parent)
            else:                             # mirror cases
                uncle = z.parent.parent.left
                if uncle.color == RED:
                    z.parent.color = BLACK
                    uncle.color = BLACK
                    z.parent.parent.color = RED
                    z = z.parent.parent
                else:
                    if z == z.parent.left:
                        z = z.parent
                        self._rotate_right(z)
                    z.parent.color = BLACK
                    z.parent.parent.color = RED
                    self._rotate_left(z.parent.parent)
        self.root.color = BLACK`,
    },
    {
      language: "python",
      caption: "B-Tree search and split (order m)",
      source: `class BTreeNode:
    def __init__(self, leaf=True):
        self.keys = []      # sorted keys
        self.children = []   # child pointers (len = len(keys)+1 for internal)
        self.leaf = leaf

class BTree:
    def __init__(self, t=2):       # minimum degree t; max keys = 2t-1
        self.t = t
        self.root = BTreeNode()

    def search(self, node, key):
        i = 0
        while i < len(node.keys) and key > node.keys[i]:
            i += 1
        if i < len(node.keys) and key == node.keys[i]:
            return (node, i)
        if node.leaf:
            return None
        return self.search(node.children[i], key)

    def _split_child(self, parent, i):
        t = self.t
        full = parent.children[i]
        new = BTreeNode(leaf=full.leaf)
        mid_key = full.keys[t - 1]

        new.keys = full.keys[t:]       # right half of keys
        full.keys = full.keys[:t - 1]  # left half (median removed)

        if not full.leaf:
            new.children = full.children[t:]
            full.children = full.children[:t]

        parent.children.insert(i + 1, new)
        parent.keys.insert(i, mid_key)

    def insert(self, key):
        root = self.root
        if len(root.keys) == 2 * self.t - 1:   # root is full
            new_root = BTreeNode(leaf=False)
            new_root.children.append(root)
            self._split_child(new_root, 0)
            self.root = new_root
        self._insert_nonfull(self.root, key)

    def _insert_nonfull(self, node, key):
        i = len(node.keys) - 1
        if node.leaf:
            node.keys.append(None)
            while i >= 0 and key < node.keys[i]:
                node.keys[i + 1] = node.keys[i]
                i -= 1
            node.keys[i + 1] = key
        else:
            while i >= 0 and key < node.keys[i]:
                i -= 1
            i += 1
            if len(node.children[i].keys) == 2 * self.t - 1:
                self._split_child(node, i)
                if key > node.keys[i]:
                    i += 1
            self._insert_nonfull(node.children[i], key)`,
    },
  ],
  diagrams: [
    {
      title: "AVL Rotation Cases",
      kind: "flow",
      caption:
        "The four imbalance cases (LL, RR, LR, RL) and the single or double rotations that restore AVL balance.",
    },
    {
      title: "Red-Black Tree Properties",
      kind: "state",
      caption:
        "State diagram showing how insertion fix-up transitions between the three cases (recolor, triangle rotation, line rotation) until the root is reached.",
    },
    {
      title: "B-Tree Node Split",
      kind: "flow",
      caption:
        "How a full B-Tree node splits: the median key is promoted to the parent and the node is divided into two half-full nodes.",
    },
    {
      title: "Balanced Tree Family Taxonomy",
      kind: "mindmap",
      caption:
        "Relationships among balanced tree variants: BST -> AVL, Red-Black, Splay; B-Tree -> B+Tree, B*Tree; Red-Black <-> 2-3-4 Tree isometry.",
    },
  ],
  animations: [
    {
      title: "AVL Left-Right (Double) Rotation",
      steps: [
        {
          label: "Initial imbalance detected",
          detail:
            "After inserting a key into the right subtree of the left child, the root's balance factor becomes +2 (left-heavy) but the left child's balance factor is -1 (right-heavy), creating an LR case.",
        },
        {
          label: "Left-rotate the left child",
          detail:
            "Perform a left rotation on the left child. This converts the LR case into a simple LL case by moving the problematic grandchild up to become the new left child.",
        },
        {
          label: "Right-rotate the root",
          detail:
            "Perform a right rotation on the root. The former grandchild (now the left child) becomes the new root of the subtree, restoring balance factors to 0 or +/-1 for all nodes.",
        },
        {
          label: "Heights updated",
          detail:
            "Update the stored height of each affected node bottom-up. The subtree height has decreased by 1, which may trigger further rebalancing up the ancestor chain during deletion (but never during insertion).",
        },
      ],
    },
    {
      title: "Red-Black Insert Fix-Up",
      steps: [
        {
          label: "New red node inserted",
          detail:
            "The new node is colored red and placed as a leaf. If the parent is black, no property is violated and we are done. If the parent is red, we have a red-red violation (property 4).",
        },
        {
          label: "Case 1 -- Red uncle",
          detail:
            "Both parent and uncle are red. Recolor parent and uncle to black, grandparent to red. Move the focus to the grandparent and repeat. This may propagate to the root.",
        },
        {
          label: "Case 2 -- Black uncle, triangle",
          detail:
            "Uncle is black and the new node forms a triangle with parent and grandparent (e.g., parent is left child, new node is right child). Rotate the parent in the opposite direction to convert to Case 3.",
        },
        {
          label: "Case 3 -- Black uncle, line",
          detail:
            "Uncle is black and the three nodes form a line. Recolor the parent black and grandparent red, then rotate the grandparent. The subtree is now balanced and we are done.",
        },
        {
          label: "Root recolored black",
          detail:
            "After all fix-ups, the root is unconditionally set to black. This may increase the black-height of the entire tree by one, which is the only way the black-height grows.",
        },
      ],
    },
    {
      title: "B-Tree Insertion with Node Split",
      steps: [
        {
          label: "Search for insertion position",
          detail:
            "Starting at the root, descend to the appropriate leaf by comparing the key with node keys at each level. At each level, if a child node is full (2t-1 keys), preemptively split it before descending.",
        },
        {
          label: "Insert into leaf",
          detail:
            "Place the key in sorted position within the leaf node. If the leaf has room (fewer than 2t-1 keys), we are done.",
        },
        {
          label: "Leaf overflow triggers split",
          detail:
            "If the leaf now has 2t-1 keys and the proactive split was not used, split it: the median key is pushed up to the parent, and the node is divided into two nodes each with t-1 keys.",
        },
        {
          label: "Split propagation",
          detail:
            "If promoting the median key causes the parent to overflow, repeat the split at the parent level. In the worst case, splits cascade to the root, creating a new root and increasing tree height by one.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Property",
      "AVL Tree",
      "Red-Black Tree",
      "B-Tree (order m)",
      "Splay Tree",
    ],
    rows: [
      [
        "Max height",
        "~1.44 log2 n",
        "2 log2(n+1)",
        "log_{m/2} n",
        "O(n) worst case",
      ],
      [
        "Search",
        "O(log n) worst",
        "O(log n) worst",
        "O(log n) worst",
        "O(log n) amortized",
      ],
      [
        "Insert rotations",
        "At most 2",
        "At most 2 + O(log n) recolors",
        "At most O(log_m n) splits",
        "O(log n) amortized restructuring",
      ],
      [
        "Delete rotations",
        "O(log n) worst",
        "At most 3",
        "At most O(log_m n) merges",
        "O(log n) amortized restructuring",
      ],
      [
        "Space per node",
        "key + height + 2 ptrs",
        "key + 1 bit color + 3 ptrs",
        "up to m-1 keys + m ptrs",
        "key + 2 ptrs",
      ],
      [
        "Best for",
        "Read-heavy in-memory",
        "Mixed read/write in-memory",
        "Disk-based / DB indexes",
        "Skewed access patterns",
      ],
      [
        "Used in",
        "Linux kernel (vm_area_struct pre-4.x)",
        "C++ std::map, Java TreeMap, Linux CFS",
        "All major RDBMS indexes, filesystems",
        "Berkeley DB, some caches",
      ],
    ],
  },
  interviewQA: [
    {
      q: "Why do Red-Black trees allow at most 2 rotations on insert while AVL trees also allow at most 2, yet Red-Black trees are generally preferred in standard libraries?",
      a: "While both require at most 2 rotations per insert, AVL trees can require O(log n) rotations per delete because the balance is stricter (factor limited to {-1,0,1}). Red-Black trees require at most 3 rotations per delete. In workloads with frequent insertions and deletions, Red-Black trees perform less structural work overall. Additionally, Red-Black trees require only 1 bit of extra storage per node (color) versus an integer (height or balance factor) for AVL trees, though this difference is often negligible in practice.",
      followUps: [
        "Can you describe a workload where AVL trees would outperform Red-Black trees?",
        "How does the 2-3-4 tree isometry help you reason about Red-Black tree operations?",
      ],
    },
    {
      q: "Explain the four rotation cases in an AVL tree and when each applies.",
      a: "After insertion, if a node's balance factor becomes +2 or -2, we have four cases based on which subtree is heavy and where the new key went. Left-Left (LL): left child is left-heavy -- single right rotation on the unbalanced node. Right-Right (RR): right child is right-heavy -- single left rotation. Left-Right (LR): left child is right-heavy -- left-rotate the left child, then right-rotate the root. Right-Left (RL): right child is left-heavy -- right-rotate the right child, then left-rotate the root. After at most one single or double rotation, the subtree is balanced for insertion. Deletion can require rotations at every ancestor.",
      followUps: [
        "Why does insertion need at most one restructuring step but deletion might need O(log n)?",
        "How do you compute the balance factor efficiently without traversing subtrees?",
      ],
    },
    {
      q: "What are the five properties of a Red-Black tree and why does each matter?",
      a: "1) Every node is red or black -- defines the coloring domain. 2) The root is black -- simplifies case analysis and ensures the black-height is well-defined. 3) Every NIL leaf is black -- provides a uniform base case. 4) A red node cannot have a red child -- prevents two consecutive reds, bounding path lengths. 5) Every path from a node to its descendant NIL leaves has the same number of black nodes (black-height) -- this, combined with property 4, ensures the longest path (alternating red-black) is at most twice the shortest (all black), guaranteeing O(log n) height.",
      followUps: [
        "What happens if you relax property 4 but keep everything else?",
        "How does the black-height relate to the minimum number of nodes in the tree?",
      ],
    },
    {
      q: "Why are B-Trees preferred over balanced BSTs for database indexing?",
      a: "Database indexes reside on disk, where the cost of a random I/O (seek + read a page) is orders of magnitude higher than in-memory comparisons. B-Trees minimize disk reads by packing hundreds or thousands of keys into each node sized to match a disk page (typically 4-16 KB). A B-Tree of order 1000 with a billion keys is only 3 levels deep, requiring at most 3 disk reads per lookup. A Red-Black tree with the same data would be ~30 levels deep, requiring up to 30 random reads. B+ Trees further optimize range scans by linking leaf nodes in a doubly-linked list.",
      followUps: [
        "What is the difference between B-Trees and B+ Trees?",
        "How does the choice of page size affect B-Tree order and performance?",
        "What is write amplification in B-Trees and how do LSM-Trees address it?",
      ],
    },
    {
      q: "How would you implement an order-statistic tree to find the k-th smallest element in O(log n)?",
      a: "Augment each node with a 'size' field storing the number of nodes in its subtree (including itself). To find the k-th smallest: let r = left.size + 1 (the rank of the current node). If k == r, return the current node. If k < r, recurse into the left subtree. If k > r, recurse into the right subtree searching for the (k-r)-th element. During rotations, update the size fields by recalculating size = left.size + right.size + 1 for the affected nodes. This works on any balanced BST (AVL, Red-Black) and adds O(1) work per rotation.",
      followUps: [
        "How would you use this to count elements in a range [lo, hi] efficiently?",
        "Can you augment a B-Tree for order statistics? What changes?",
      ],
    },
    {
      q: "What is the relationship between Red-Black trees and 2-3-4 trees?",
      a: "Every Red-Black tree corresponds to a 2-3-4 tree and vice versa. A black node with no red children is a 2-node. A black node with one red child is a 3-node (the red child and the black parent together store two keys). A black node with two red children is a 4-node (three keys). This isometry, identified by Sedgewick, means that Red-Black tree operations (rotations and recolorings) directly map to 2-3-4 tree operations (splits and fusions). Left-Leaning Red-Black Trees (LLRBs) restrict red links to left children only, corresponding to 2-3 trees and simplifying the implementation.",
      followUps: [
        "How does understanding this isometry help debug Red-Black tree code?",
        "What is the difference between a 2-3 tree and a 2-3-4 tree in terms of Red-Black variants?",
      ],
    },
    {
      q: "Compare the amortized complexity of splay trees with the worst-case guarantees of AVL and Red-Black trees. When might you choose a splay tree?",
      a: "Splay trees provide O(log n) amortized time for all operations but O(n) worst case for a single operation. AVL and Red-Black trees guarantee O(log n) worst case per operation. Splay trees are advantageous when access patterns are skewed: frequently accessed elements migrate to the root, achieving a 'working set' property where accessing k distinct items in a sequence costs O(n log n + m log k) for m operations. They are also simpler to implement (no balance metadata) and have excellent cache behavior for skewed workloads. However, they are unsuitable for real-time systems requiring per-operation guarantees or for concurrent access (every read mutates the tree).",
      followUps: [
        "What is the static optimality conjecture for splay trees?",
        "Why are splay trees problematic in concurrent or multi-threaded environments?",
      ],
    },
  ],
  followUps: [
    "How do skip lists compare to balanced BSTs in practice?",
    "What are the trade-offs between B-Trees and LSM-Trees for write-heavy workloads?",
    "How does the Linux kernel's switch from AVL trees to Red-Black trees for vm_area_struct illustrate practical engineering trade-offs?",
    "What is a treap and how does randomization provide expected O(log n) balance?",
    "How do persistent (functional) balanced trees differ from ephemeral ones?",
  ],
  mcqs: [
    {
      q: "What is the maximum height of an AVL tree with n nodes?",
      options: [
        "log2(n)",
        "~1.44 log2(n)",
        "2 log2(n)",
        "n/2",
      ],
      answerIndex: 1,
      explanation:
        "AVL trees have a maximum height of approximately 1.44 log2(n+2), derived from the Fibonacci-like recurrence for the minimum number of nodes at each height.",
    },
    {
      q: "Which Red-Black tree property directly prevents arbitrarily long paths?",
      options: [
        "The root must be black",
        "Every NIL leaf is black",
        "No red node may have a red child",
        "All paths have the same black-height",
      ],
      answerIndex: 3,
      explanation:
        "The equal black-height property (property 5), combined with the no-consecutive-reds rule (property 4), ensures the longest path is at most twice the shortest, bounding the tree height to O(log n).",
    },
    {
      q: "How many rotations does a Red-Black tree require in the worst case for a single deletion?",
      options: ["0", "1", "2", "3"],
      answerIndex: 3,
      explanation:
        "Red-Black tree deletion requires at most 3 rotations (plus O(log n) recolorings). This bounded rotation count is a key advantage over AVL trees, which may require O(log n) rotations per deletion.",
    },
    {
      q: "In a B-Tree of minimum degree t, what is the maximum number of keys a node can hold?",
      options: ["t", "t-1", "2t", "2t-1"],
      answerIndex: 3,
      explanation:
        "A B-Tree node can hold at most 2t-1 keys and has at most 2t children. When a node reaches 2t-1 keys, it must be split before inserting another key.",
    },
    {
      q: "What data structure is a Red-Black tree isomorphic to?",
      options: [
        "Binary heap",
        "2-3-4 tree",
        "Fibonacci heap",
        "Skip list",
      ],
      answerIndex: 1,
      explanation:
        "A Red-Black tree is an isometry of a 2-3-4 tree (an order-4 B-Tree). A black node with its red children corresponds to a 2-node, 3-node, or 4-node depending on the number of red children.",
    },
    {
      q: "Which balanced tree variant is most commonly used for relational database indexes?",
      options: [
        "AVL tree",
        "Red-Black tree",
        "B+ Tree",
        "Splay tree",
      ],
      answerIndex: 2,
      explanation:
        "B+ Trees are the standard for database indexes because all values are in leaf nodes (which are linked for efficient range scans), and the high branching factor minimizes disk I/O.",
    },
    {
      q: "An AVL insertion causes a balance factor of +2 at a node, and its left child has a balance factor of -1. Which rotation sequence restores balance?",
      options: [
        "Single right rotation",
        "Single left rotation",
        "Left rotation on left child, then right rotation on the node",
        "Right rotation on right child, then left rotation on the node",
      ],
      answerIndex: 2,
      explanation:
        "This is the Left-Right (LR) case. The left child is right-heavy (factor -1), so we first left-rotate the left child to convert it to an LL case, then right-rotate the unbalanced node.",
    },
  ],
  exercises: [
    "Implement AVL deletion with all rotation cases and verify that the tree remains balanced by asserting the balance factor invariant after each operation on a random sequence of 10,000 insertions and deletions.",
    "Build a Red-Black tree and write a function that validates all five Red-Black properties. Use it as a test oracle for your insert and delete implementations.",
    "Implement a B-Tree of order 5 with insert, search, and delete. Visualize the tree after each operation on the sequence [10, 20, 5, 6, 12, 30, 7, 17].",
    "Augment a Red-Black tree to support order-statistic queries (find k-th smallest, rank of a key). Verify with a sorted array oracle on random inputs.",
    "Compare the number of rotations performed by AVL and Red-Black trees on the same sequence of n random insertions followed by n/2 random deletions. Plot the results for n = 100 to 100,000.",
    "Implement a Left-Leaning Red-Black Tree (LLRB) and compare its code complexity and rotation count with a standard Red-Black tree implementation.",
  ],
  flashcards: [
    {
      front: "What is the balance factor of an AVL node?",
      back: "height(left subtree) - height(right subtree). Must be in {-1, 0, 1} for the tree to be AVL-balanced.",
    },
    {
      front: "How many rotations does an AVL insert require at most?",
      back: "At most one single or one double rotation (2 rotations total). After that one restructuring, the subtree height is restored and no further rotations propagate.",
    },
    {
      front: "List the 5 Red-Black tree properties.",
      back: "1) Nodes are red or black. 2) Root is black. 3) NIL leaves are black. 4) Red nodes have only black children. 5) All root-to-NIL paths have equal black-height.",
    },
    {
      front: "What is the maximum height of a Red-Black tree with n internal nodes?",
      back: "2 log2(n+1). The longest path (alternating red-black) is at most twice the shortest (all black).",
    },
    {
      front: "What is the correspondence between Red-Black trees and 2-3-4 trees?",
      back: "A black node with 0 red children = 2-node, 1 red child = 3-node, 2 red children = 4-node. Color flips correspond to 4-node splits.",
    },
    {
      front: "In a B-Tree of minimum degree t, how many keys can a non-root node hold?",
      back: "Between t-1 (minimum) and 2t-1 (maximum). The root can hold as few as 1 key.",
    },
    {
      front: "Why are B-Trees preferred for disk-based storage?",
      back: "Each node is sized to a disk page, and the high branching factor (hundreds to thousands) minimizes the tree height and thus disk I/O operations.",
    },
    {
      front: "What is a B+ Tree and how does it differ from a B-Tree?",
      back: "In a B+ Tree, all data/values are stored only in leaf nodes, and leaf nodes are linked in a chain. Internal nodes store only keys for routing. This optimizes sequential/range scans.",
    },
    {
      front: "What is an order-statistic tree?",
      back: "A balanced BST augmented with a 'size' field at each node (number of nodes in its subtree), enabling O(log n) k-th smallest queries and rank queries.",
    },
    {
      front: "AVL deletion vs. insertion: which can cause more rotations?",
      back: "Deletion can cause O(log n) rotations (one at each ancestor), while insertion causes at most one single or double rotation.",
    },
  ],
  revisionNotes: [
    "Self-balancing BSTs prevent worst-case O(n) degradation by maintaining a height invariant through rotations or recolorings after each insert/delete.",
    "AVL invariant: |balance factor| <= 1 at every node. Stricter than Red-Black, giving shorter trees (~1.44 log n) but more work on deletions.",
    "Red-Black invariant: equal black-height on all paths, no consecutive red nodes. Height <= 2 log2(n+1). At most 2 rotations per insert, 3 per delete.",
    "Red-Black trees are isomorphic to 2-3-4 trees. A color flip = splitting a 4-node. This insight simplifies reasoning about correctness.",
    "B-Trees minimize disk I/O by matching node size to page size and maximizing branching factor. B+ Trees add leaf-linking for efficient range queries.",
    "AVL is better for read-heavy in-memory workloads (shorter trees). Red-Black is better for write-heavy workloads (fewer rotations on delete). B-Trees dominate on disk.",
    "Augmenting balanced trees (order statistics, intervals, range queries) works because rotations can cheaply maintain extra metadata in O(1) per rotation.",
    "For concurrent access, B-Trees support lock-coupling (crabbing) and Blink-Tree optimizations. Concurrent Red-Black trees are complex; skip lists or concurrent hash maps are often preferred.",
  ],
  cheatSheet: [
    "AVL: BF = h(L) - h(R), must be in {-1, 0, 1}. Four cases: LL->rotR, RR->rotL, LR->rotL(child)+rotR, RL->rotR(child)+rotL.",
    "AVL height: h < 1.44 log2(n+2). Insert: O(log n) search + O(1) rotations. Delete: O(log n) search + O(log n) rotations.",
    "RB insert fix-up: Case 1 (red uncle) -> recolor. Case 2 (black uncle, triangle) -> rotate parent. Case 3 (black uncle, line) -> recolor + rotate grandparent.",
    "RB delete fix-up: at most 3 rotations + O(log n) recolorings. Always end by setting root to black.",
    "RB height: h <= 2 log2(n+1). Black-height: bh >= h/2. Min nodes: 2^bh - 1.",
    "B-Tree(t): keys per node in [t-1, 2t-1]. Children in [t, 2t]. Root can have min 1 key. Height: O(log_t n).",
    "B-Tree insert: if node full, split (push median up) before descending (proactive splitting avoids backtracking).",
    "B+ Tree: data only in leaves, leaves linked. Internal nodes are pure index. Ideal for range queries and sequential scans.",
    "Order-statistic augmentation: store subtree size. select(k): compare k with left.size+1, recurse. rank(x): accumulate sizes going up.",
    "Common library implementations: C++ std::map/set = RB tree. Java TreeMap/TreeSet = RB tree. Most RDBMS indexes = B+ Tree.",
  ],
  resources: [
    {
      label: "Introduction to Algorithms (CLRS), Chapters 12-14, 18",
      kind: "book",
      note: "The definitive textbook treatment of BSTs, Red-Black trees (Ch. 13), augmenting data structures (Ch. 14), and B-Trees (Ch. 18).",
    },
    {
      label: "Algorithms, 4th Edition by Sedgewick & Wayne",
      kind: "book",
      note: "Excellent coverage of Red-Black trees via the 2-3 tree isometry. The Left-Leaning Red-Black Tree simplification is introduced here.",
    },
    {
      label: "Sedgewick - Left-Leaning Red-Black Trees (2008 paper)",
      kind: "paper",
      note: "Describes a simplified Red-Black tree variant that restricts red links to left children, reducing implementation complexity significantly.",
    },
    {
      label: "MIT 6.006 - AVL Trees lecture (YouTube)",
      kind: "video",
      note: "Clear explanation of AVL rotations and height analysis with visual demonstrations.",
    },
    {
      label: "CMU 15-445 Database Systems - B+ Tree Indexes lectures",
      kind: "video",
      note: "Production-oriented coverage of B+ Tree design for database storage engines, including concurrency control and bulk loading.",
    },
    {
      label: "Visualgo - BST / AVL / B-Tree visualizations",
      kind: "docs",
      note: "Interactive web-based visualizations that animate insertions, deletions, and rotations step by step.",
    },
    {
      label: "The Art of Computer Programming, Vol. 3 by Knuth - Section 6.2.3",
      kind: "book",
      note: "Rigorous mathematical analysis of balanced trees, including height bounds and expected rotation counts.",
    },
    {
      label: "Linux kernel rbtree.h source code",
      kind: "repo",
      note: "Production Red-Black tree implementation used throughout the Linux kernel (CFS scheduler, memory management, etc.).",
    },
  ],
  glossary: [
    {
      term: "Balance factor",
      definition:
        "The difference between the height of a node's left and right subtrees. In AVL trees, this must be in {-1, 0, 1}.",
    },
    {
      term: "Rotation",
      definition:
        "A local tree restructuring operation that changes parent-child relationships while preserving BST ordering. Single rotations (left or right) and double rotations (a pair of singles) restore balance.",
    },
    {
      term: "Black-height",
      definition:
        "The number of black nodes on any path from a node to a descendant NIL leaf (not counting the node itself). All paths must have the same black-height in a Red-Black tree.",
    },
    {
      term: "Color flip (recoloring)",
      definition:
        "Changing a black node to red and its two red children to black (or vice versa). Corresponds to splitting a 4-node in a 2-3-4 tree.",
    },
    {
      term: "B-Tree order / minimum degree (t)",
      definition:
        "The minimum degree t determines the range of keys per node: [t-1, 2t-1]. The order m = 2t gives the maximum number of children per node.",
    },
    {
      term: "Node split",
      definition:
        "When a B-Tree node overflows (reaches 2t-1 keys), it is divided into two nodes and the median key is promoted to the parent.",
    },
    {
      term: "2-3-4 tree",
      definition:
        "A balanced search tree where each internal node has 2, 3, or 4 children. Isomorphic to a Red-Black tree; used as a conceptual model for understanding Red-Black operations.",
    },
    {
      term: "Amortized complexity",
      definition:
        "The average cost per operation over a worst-case sequence of operations, not the average over random inputs. Splay trees have O(log n) amortized but O(n) worst-case per operation.",
    },
    {
      term: "Order-statistic tree",
      definition:
        "A balanced BST augmented with subtree sizes to support O(log n) selection (find k-th smallest) and rank (find the rank of a key) queries.",
    },
    {
      term: "Lock-coupling (crabbing)",
      definition:
        "A concurrency control technique for B-Trees: lock the child node before releasing the parent, and release the parent early if the child is safe (cannot split or merge).",
    },
  ],
};
