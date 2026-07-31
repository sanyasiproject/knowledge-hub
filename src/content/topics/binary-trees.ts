import type { TopicContent } from "../types";

export const binaryTrees: TopicContent = {
  quickSummary: [
    "A binary tree is a hierarchical structure where each node has at most two children (left and right); key metrics are height (longest root-to-leaf path) and depth (root-to-node distance).",
    "Four traversals define how you visit nodes: inorder (left-root-right, gives sorted order for BSTs), preorder (root-left-right), postorder (left-right-root), and level-order (BFS by depth).",
    "A Binary Search Tree (BST) enforces left < root < right, enabling O(h) search/insert/delete where h is the tree height — O(log n) when balanced, O(n) when degenerate.",
    "Self-balancing BSTs (AVL trees, Red-Black trees) maintain O(log n) height through rotations on insert/delete, guaranteeing worst-case O(log n) operations.",
  ],
  detailed: [
    "A binary tree is a rooted tree where each node has at most two children, conventionally called left and right. The height of a node is the length of the longest path from that node down to a leaf; the height of the tree is the height of the root. The depth of a node is the length of the path from the root down to that node. A binary tree with n nodes has height between floor(log2 n) (complete tree) and n-1 (degenerate/skewed tree). The number of null pointers in a binary tree with n nodes is always n+1.",
    "Tree traversals visit every node exactly once in a specific order. Inorder (left, root, right) visits a BST's nodes in sorted order — this is the basis for iterator-based BST traversal. Preorder (root, left, right) is used to serialize/copy a tree because processing the root first lets you reconstruct the structure. Postorder (left, right, root) is used for deletion and expression tree evaluation — you must process children before the parent. Level-order traversal uses a queue (BFS) and visits nodes depth by depth, useful for finding the minimum depth or printing the tree level by level.",
    "A Binary Search Tree (BST) is a binary tree where for every node, all values in the left subtree are strictly less and all values in the right subtree are strictly greater. Search follows a binary search: compare with the root, go left if smaller, right if larger — O(h) time. Insertion finds the appropriate null position using the same logic. Deletion has three cases: leaf (just remove), one child (replace with child), two children (replace with inorder successor or predecessor, then delete that node). All operations are O(h), which is O(log n) for balanced trees but O(n) for skewed trees.",
    "AVL trees maintain balance by ensuring that for every node, the heights of the left and right subtrees differ by at most 1 (the balance factor is in {-1, 0, 1}). After an insertion or deletion, if the balance factor violates this constraint, one or two rotations restore it. There are four cases: Left-Left (single right rotation), Right-Right (single left rotation), Left-Right (left rotation on left child, then right rotation), and Right-Left (right rotation on right child, then left rotation). AVL trees guarantee O(log n) height and thus O(log n) worst-case operations, but rotations add constant-factor overhead.",
    "Red-Black trees are self-balancing BSTs where each node is colored red or black, subject to five properties: (1) every node is red or black, (2) the root is black, (3) all leaves (null nodes) are black, (4) red nodes cannot have red children, (5) every path from a node to its descendant leaves has the same number of black nodes (black-height). These properties guarantee that the longest path is at most twice the shortest, so the height is at most 2*log2(n+1). Red-Black trees are used in Java's TreeMap, C++ std::map, and the Linux kernel's CFS scheduler. They require fewer rotations than AVL trees on insertion (at most 2) and deletion (at most 3).",
  ],
  deepDive: [
    "The Lowest Common Ancestor (LCA) of two nodes p and q is the deepest node that is an ancestor of both. In a BST, LCA is simple: starting from the root, if both p and q are smaller, go left; if both are larger, go right; otherwise the current node is the LCA — O(h) time. In a general binary tree, the recursive approach checks if p or q is found in the left or right subtree: if both subtrees return non-null, the current node is the LCA; if only one returns non-null, that is the LCA. This runs in O(n) time. For repeated LCA queries, preprocess with Euler tour + sparse table for O(1) per query after O(n log n) preprocessing.",
    "Morris traversal performs inorder traversal in O(n) time and O(1) space (no stack, no recursion) by temporarily threading the tree. For each node, if it has no left child, visit it and go right. If it has a left child, find its inorder predecessor (rightmost node in the left subtree). If the predecessor's right pointer is null, thread it to the current node and go left. If it already points to the current node, the left subtree is done — unthread, visit the current node, and go right. This modifies the tree temporarily but restores it fully by the end.",
    "Constructing a binary tree from traversal sequences: given inorder and preorder (or postorder), you can uniquely reconstruct the tree. Preorder's first element is the root; find it in inorder to split into left and right subtrees; recurse. Using a hash map for inorder index lookup gives O(n) total time. Given only preorder and postorder, the tree is not unique unless it is a full binary tree (every node has 0 or 2 children).",
    "Tree serialization and deserialization converts a binary tree to a string and back. A common approach uses preorder traversal with a sentinel (e.g., '#') for null nodes. Serialize: visit root, output value, recurse left, recurse right, output '#' for nulls. Deserialize: read values in order, reconstruct using a queue or iterator. Level-order serialization (BFS with nulls) is used by LeetCode's tree format. Both approaches run in O(n) time and space.",
  ],
  code: [
    {
      language: "cpp",
      caption: "BST operations: insert, search, delete, and all four traversals",
      source: `#include <iostream>
#include <vector>
#include <queue>
#include <memory>

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

TreeNode* insert_bst(TreeNode* root, int val) {
    if (!root) return new TreeNode(val);
    if (val < root->val)
        root->left = insert_bst(root->left, val);
    else if (val > root->val)
        root->right = insert_bst(root->right, val);
    return root;
}

TreeNode* search_bst(TreeNode* root, int val) {
    if (!root || root->val == val) return root;
    return val < root->val ? search_bst(root->left, val)
                           : search_bst(root->right, val);
}

TreeNode* delete_bst(TreeNode* root, int val) {
    if (!root) return nullptr;
    if (val < root->val)
        root->left = delete_bst(root->left, val);
    else if (val > root->val)
        root->right = delete_bst(root->right, val);
    else {
        // Node found
        if (!root->left) { auto tmp = root->right; delete root; return tmp; }
        if (!root->right) { auto tmp = root->left; delete root; return tmp; }
        // Two children: replace with inorder successor
        TreeNode* succ = root->right;
        while (succ->left) succ = succ->left;
        root->val = succ->val;
        root->right = delete_bst(root->right, succ->val);
    }
    return root;
}

// Traversals
void inorder(TreeNode* root, std::vector<int>& result) {
    if (!root) return;
    inorder(root->left, result);
    result.push_back(root->val);
    inorder(root->right, result);
}

void preorder(TreeNode* root, std::vector<int>& result) {
    if (!root) return;
    result.push_back(root->val);
    preorder(root->left, result);
    preorder(root->right, result);
}

void postorder(TreeNode* root, std::vector<int>& result) {
    if (!root) return;
    postorder(root->left, result);
    postorder(root->right, result);
    result.push_back(root->val);
}

std::vector<std::vector<int>> level_order(TreeNode* root) {
    std::vector<std::vector<int>> result;
    if (!root) return result;
    std::queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        int level_size = q.size();
        std::vector<int> level;
        for (int i = 0; i < level_size; ++i) {
            TreeNode* node = q.front(); q.pop();
            level.push_back(node->val);
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
        result.push_back(level);
    }
    return result;
}`,
    },
    {
      language: "cpp",
      caption: "Lowest Common Ancestor for BST and general binary tree",
      source: `#include <algorithm>
#include <climits>

// LCA in a BST. O(h) time, O(1) space (iterative).
TreeNode* lca_bst(TreeNode* root, TreeNode* p, TreeNode* q) {
    while (root) {
        if (p->val < root->val && q->val < root->val)
            root = root->left;
        else if (p->val > root->val && q->val > root->val)
            root = root->right;
        else
            return root;  // split point is the LCA
    }
    return nullptr;
}

// LCA in a general binary tree. O(n) time, O(h) space.
TreeNode* lca_binary_tree(TreeNode* root, TreeNode* p, TreeNode* q) {
    if (!root || root == p || root == q) return root;
    TreeNode* left  = lca_binary_tree(root->left, p, q);
    TreeNode* right = lca_binary_tree(root->right, p, q);
    if (left && right) return root;   // p and q are in different subtrees
    return left ? left : right;       // both in the same subtree
}

// Check if a binary tree is a valid BST. O(n).
bool is_valid_bst(TreeNode* root, long lo = LONG_MIN, long hi = LONG_MAX) {
    if (!root) return true;
    if (root->val <= lo || root->val >= hi) return false;
    return is_valid_bst(root->left, lo, root->val)
        && is_valid_bst(root->right, root->val, hi);
}

// Height of the tree. O(n).
int max_depth(TreeNode* root) {
    if (!root) return 0;
    return 1 + std::max(max_depth(root->left), max_depth(root->right));
}`,
    },
  ],
  diagrams: [
    {
      title: "BST Insert and Delete Operations",
      kind: "flow",
      caption:
        "Insert: traverse left/right based on comparison until a null child is found, then attach. Delete: three cases — leaf removal, single-child promotion, two-child replacement with inorder successor.",
    },
    {
      title: "AVL Tree Rotation Cases",
      kind: "state",
      caption:
        "Four imbalance cases and their rotations: LL (right rotate), RR (left rotate), LR (left rotate child, then right rotate), RL (right rotate child, then left rotate). Each rotation is O(1).",
    },
  ],
  animations: [
    {
      title: "Inorder Traversal of a BST",
      steps: [
        {
          label: "Start at root (8)",
          detail:
            "Root is 8 with left child 3 and right child 10. Inorder visits left subtree first, so descend to node 3.",
        },
        {
          label: "Descend to leftmost node (1)",
          detail:
            "Node 3 has left child 1. Node 1 has no children. Visit 1 (leftmost = smallest). Output: [1].",
        },
        {
          label: "Visit node 3 and its right subtree",
          detail:
            "Return to node 3, visit it. Then visit its right subtree: node 6, which has children 4 and 7. Visit 4, then 6, then 7. Output: [1, 3, 4, 6, 7].",
        },
        {
          label: "Visit root (8)",
          detail:
            "Left subtree of root is fully visited. Visit root 8. Output: [1, 3, 4, 6, 7, 8].",
        },
        {
          label: "Traverse right subtree",
          detail:
            "Descend to node 10. It has no left child, so visit 10. Then visit its right child 14, which has left child 13. Visit 13, then 14. Output: [1, 3, 4, 6, 7, 8, 10, 13, 14].",
        },
        {
          label: "Traversal complete",
          detail:
            "All nodes visited in sorted order. Inorder traversal of a BST always produces a sorted sequence. This property is the basis for BST validation.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Property",
      "Unbalanced BST",
      "AVL Tree",
      "Red-Black Tree",
      "B-Tree",
    ],
    rows: [
      [
        "Height guarantee",
        "O(n) worst case",
        "O(1.44 log n) strict",
        "O(2 log n) loose",
        "O(log_B n)",
      ],
      [
        "Search",
        "O(n) worst",
        "O(log n)",
        "O(log n)",
        "O(log n)",
      ],
      [
        "Insert",
        "O(n) worst",
        "O(log n) + up to 2 rotations",
        "O(log n) + up to 2 rotations",
        "O(log n) with splits",
      ],
      [
        "Delete",
        "O(n) worst",
        "O(log n) + up to O(log n) rotations",
        "O(log n) + up to 3 rotations",
        "O(log n) with merges",
      ],
      [
        "Balance strictness",
        "None",
        "Strict (BF in {-1,0,1})",
        "Loose (path lengths within 2x)",
        "All leaves at same depth",
      ],
      [
        "Use cases",
        "Teaching, simple cases",
        "Databases, lookup-heavy",
        "Language libraries (TreeMap, std::map)",
        "Filesystems, databases (disk-based)",
      ],
    ],
  },
  interviewQA: [
    {
      q: "What are the four binary tree traversal orders and when would you use each?",
      a: "Inorder (L, Root, R): visits BST nodes in sorted order; used for BST validation and sorted iteration. Preorder (Root, L, R): processes root before children; used for tree serialization and copying because knowing the root first lets you reconstruct structure. Postorder (L, R, Root): processes children before parent; used for deletion (delete children before parent) and expression tree evaluation (evaluate operands before applying operator). Level-order (BFS with queue): visits nodes depth by depth; used for shortest path, level-by-level printing, and finding minimum depth.",
      followUps: [
        "How do you perform inorder traversal iteratively without recursion?",
        "What is Morris traversal and how does it achieve O(1) space?",
        "Given preorder and inorder sequences, can you reconstruct the tree?",
      ],
    },
    {
      q: "How does BST deletion work when the node has two children?",
      a: "Find the inorder successor (smallest node in the right subtree — go right once, then left as far as possible). Copy the successor's value into the node being deleted. Then recursively delete the successor from the right subtree. The successor has at most one child (right), so its deletion falls into the simpler cases. Alternatively, use the inorder predecessor (largest in the left subtree). Both approaches maintain the BST invariant. Time: O(h).",
      followUps: [
        "Why does the inorder successor have at most one child?",
        "When would you prefer predecessor over successor?",
        "How does deletion affect tree balance?",
      ],
    },
    {
      q: "Explain how AVL rotations restore balance after insertion.",
      a: "After inserting a node, walk back up to the root updating heights. If a node's balance factor (left height - right height) becomes +2 or -2, it is unbalanced. Four cases: LL (inserted in left child's left subtree) - single right rotation; RR (inserted in right child's right subtree) - single left rotation; LR (left child's right subtree) - left rotate the left child, then right rotate the node; RL (right child's left subtree) - right rotate the right child, then left rotate the node. Each rotation is O(1) and at most one rotation (single or double) is needed per insertion.",
      followUps: [
        "How many rotations can a single AVL deletion require?",
        "How does AVL compare to Red-Black in terms of rotation frequency?",
        "What is the maximum height of an AVL tree with n nodes?",
      ],
    },
    {
      q: "Find the Lowest Common Ancestor of two nodes in a binary tree.",
      a: "For a general binary tree: recursively search left and right subtrees for p and q. Base case: if root is null, p, or q, return root. If left and right recursive calls both return non-null, p and q are in different subtrees, so root is the LCA. If only one returns non-null, both nodes are in that subtree, and the result is the LCA. Time: O(n), Space: O(h). For a BST, exploit ordering: if both values are less than root, go left; if both greater, go right; otherwise root is the LCA — O(h) time.",
      followUps: [
        "How would you optimize for repeated LCA queries on the same tree?",
        "What is the Euler tour technique for LCA?",
        "How does LCA relate to finding the distance between two nodes?",
      ],
    },
  ],
  followUps: [
    "How do B-trees and B+ trees extend the BST concept for disk-based storage and databases?",
    "What is a treap and how does it combine BST and heap properties?",
    "How do segment trees and Fenwick trees use tree structure for range queries?",
    "What is the difference between a complete, full, and perfect binary tree?",
  ],
  mcqs: [
    {
      q: "What is the maximum number of nodes in a binary tree of height h?",
      options: ["h", "2h", "2^h", "2^(h+1) - 1"],
      answerIndex: 3,
      explanation:
        "A perfect binary tree of height h has 2^(h+1) - 1 nodes. Height 0 (just root) has 1 node = 2^1 - 1. Height 2 has 7 nodes = 2^3 - 1.",
    },
    {
      q: "Inorder traversal of a BST produces elements in what order?",
      options: [
        "Reverse sorted",
        "Sorted (ascending)",
        "Level order",
        "Random order",
      ],
      answerIndex: 1,
      explanation:
        "Inorder visits left (smaller), root, right (larger). For a BST, this visits all nodes in ascending sorted order. This is the fundamental property that makes inorder traversal special for BSTs.",
    },
    {
      q: "In an AVL tree, what is the maximum allowed difference between left and right subtree heights?",
      options: ["0", "1", "2", "log n"],
      answerIndex: 1,
      explanation:
        "The AVL balance factor (|left height - right height|) must be at most 1 for every node. A balance factor of 2 or more triggers rotations.",
    },
    {
      q: "What is the time complexity of finding the LCA of two nodes in a balanced BST?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      answerIndex: 1,
      explanation:
        "In a BST, LCA is found by comparing both values with the current node and going left or right. In a balanced BST, this traverses at most O(log n) levels.",
    },
    {
      q: "Which traversal is used to serialize a binary tree such that it can be uniquely reconstructed?",
      options: [
        "Inorder alone",
        "Preorder alone",
        "Preorder with null markers",
        "Level-order without null markers",
      ],
      answerIndex: 2,
      explanation:
        "Preorder (or postorder) with null markers uniquely defines the tree structure. Preorder alone (without nulls) requires inorder as well. Inorder alone cannot determine the root.",
    },
  ],
  exercises: [
    "Implement a function to check if a binary tree is a valid BST. Use the range-based approach: each node's value must be within (lo, hi) bounds inherited from its ancestors.",
    "Write iterative inorder traversal using an explicit stack. Then implement Morris traversal for O(1) space inorder traversal.",
    "Given preorder and inorder traversal arrays, reconstruct the binary tree. Optimize to O(n) using a hash map for inorder index lookup.",
    "Implement a function to find the diameter of a binary tree (the longest path between any two nodes, which may or may not pass through the root).",
  ],
  flashcards: [
    {
      front: "What is the height of a binary tree with n nodes in the best and worst cases?",
      back: "Best case (balanced/complete): floor(log2 n). Worst case (degenerate/skewed): n-1. Self-balancing trees guarantee O(log n) height.",
    },
    {
      front: "What are the four traversal orders for a binary tree?",
      back: "Inorder (L, Root, R), Preorder (Root, L, R), Postorder (L, R, Root), Level-order (BFS using a queue). Inorder gives sorted order for BSTs.",
    },
    {
      front: "How does BST deletion handle a node with two children?",
      back: "Replace the node's value with its inorder successor (smallest in right subtree) or predecessor (largest in left subtree), then recursively delete that successor/predecessor node.",
    },
    {
      front: "What is the balance factor in an AVL tree?",
      back: "Balance factor = height(left subtree) - height(right subtree). It must be in {-1, 0, 1} for every node. Values outside this range trigger rotations.",
    },
    {
      front: "How does a Red-Black tree guarantee O(log n) height?",
      back: "Five color properties ensure that the longest root-to-leaf path is at most twice the shortest (every path has the same black-height). This bounds the height to at most 2*log2(n+1).",
    },
    {
      front: "What is the LCA of two nodes in a BST?",
      back: "Starting from the root, if both nodes are smaller go left, if both are larger go right. The first node where they split (or one equals the node) is the LCA. O(h) time.",
    },
    {
      front: "How many null pointers does a binary tree with n nodes have?",
      back: "Exactly n+1. Each of the n nodes has 2 pointer slots (2n total). There are n-1 edges (each non-root node has exactly one parent edge), so 2n - (n-1) = n+1 pointers are null.",
    },
    {
      front: "What is Morris traversal?",
      back: "An inorder traversal technique using O(1) space by temporarily threading the tree: the inorder predecessor's right pointer is set to the current node (creating a temporary link back), then restored after the left subtree is visited.",
    },
  ],
  revisionNotes: [
    "BST invariant: left < root < right for all nodes. Inorder traversal yields sorted order. All basic operations are O(h).",
    "Tree height: balanced = O(log n), skewed = O(n). AVL and Red-Black trees guarantee O(log n) via rotations.",
    "AVL: strict balance (BF in {-1,0,1}), up to 2 rotations on insert, up to O(log n) on delete. Best for read-heavy workloads.",
    "Red-Black: looser balance (path lengths within 2x), at most 2 rotations on insert, 3 on delete. Used in std::map, TreeMap.",
    "LCA in BST: O(h) by following the split point. In general tree: O(n) recursive check of both subtrees.",
    "Traversals: Inorder = sorted order (BST), Preorder = serialization, Postorder = deletion/evaluation, Level-order = BFS.",
  ],
  cheatSheet: [
    "BST search: if val < root go left, if val > root go right, if equal found. O(h) time.",
    "BST delete with two children: find inorder successor (go right, then left to the end), copy value, delete successor.",
    "AVL rotations: LL->right rotate, RR->left rotate, LR->left-right, RL->right-left. Each O(1).",
    "Level-order: use queue. Enqueue root, while queue not empty: dequeue, process, enqueue children.",
    "Validate BST: pass (lo, hi) bounds down recursively. Root: (-inf, inf). Left child: (lo, root.val). Right child: (root.val, hi).",
    "Tree height: base case null -> 0 (or -1 depending on convention). Recursive: 1 + max(height(left), height(right)).",
  ],
  resources: [
    {
      label: "Introduction to Algorithms (CLRS) - Chapter 12: BSTs, Chapter 13: Red-Black Trees",
      kind: "book",
      note: "Definitive treatment of BST operations, AVL trees, and Red-Black tree properties with correctness proofs.",
    },
    {
      label: "Visualgo - Binary Search Tree and AVL Visualization",
      kind: "article",
      note: "Interactive step-by-step visualization of BST insert/delete/search and AVL rotations.",
    },
    {
      label: "Abdul Bari - AVL Tree Rotations (YouTube)",
      kind: "video",
      note: "Clear visual explanation of all four AVL rotation cases with worked examples.",
    },
    {
      label: "LeetCode Binary Tree Study Plan",
      kind: "article",
      note: "Structured problem set covering traversals, BST operations, LCA, serialization, and tree construction.",
    },
    {
      label: "Red-Black Trees in 5 Minutes (YouTube)",
      kind: "video",
      note: "Concise overview of Red-Black tree properties and why they guarantee O(log n) operations.",
    },
  ],
  glossary: [
    {
      term: "Binary Search Tree (BST)",
      definition:
        "A binary tree where every node's left subtree contains only values less than the node, and the right subtree contains only values greater. Enables O(h) search, insert, and delete.",
    },
    {
      term: "Height",
      definition:
        "The length of the longest path from a node down to a leaf. A single-node tree has height 0. The height of the tree is the height of the root.",
    },
    {
      term: "Depth",
      definition:
        "The length of the path from the root to a specific node. The root has depth 0. Depth increases by 1 at each level.",
    },
    {
      term: "AVL tree",
      definition:
        "A self-balancing BST where the balance factor (left height minus right height) of every node is -1, 0, or 1. Named after inventors Adelson-Velsky and Landis (1962).",
    },
    {
      term: "Red-Black tree",
      definition:
        "A self-balancing BST that assigns a color (red or black) to each node and enforces five properties to guarantee that the tree height is O(log n).",
    },
    {
      term: "Rotation",
      definition:
        "A local tree restructuring operation (left or right) that changes parent-child relationships while preserving the BST invariant. Used by AVL and Red-Black trees to restore balance in O(1).",
    },
    {
      term: "Lowest Common Ancestor (LCA)",
      definition:
        "The deepest node in the tree that is an ancestor of both given nodes p and q. In a BST, it can be found in O(h) by exploiting the ordering property.",
    },
    {
      term: "Inorder successor",
      definition:
        "The node with the smallest value greater than a given node's value. Found by going to the right child and then following left pointers to the end. Used in BST deletion.",
    },
  ],
};
