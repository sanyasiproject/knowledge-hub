import type { TopicContent } from "../types";

export const tries: TopicContent = {
  quickSummary: [
    "A trie (prefix tree) is a tree-shaped data structure where each node represents a single character and paths from root to marked nodes spell out stored strings.",
    "Tries enable O(m) lookup, insertion, and deletion where m is the key length, independent of how many keys are stored.",
    "They excel at prefix-based operations: autocomplete, spell-checking, IP routing tables, and dictionary matching.",
    "Space can be significant because each node may hold an array of child pointers (e.g., 26 for lowercase English), but compressed variants like radix trees mitigate this.",
  ],
  detailed: [
    "A trie stores a dynamic set of strings by sharing common prefixes. The root represents the empty string; each edge is labelled with a character, and concatenating the labels on a root-to-node path gives the prefix represented by that node. A boolean flag (or stored value) at a node marks it as the end of a complete key. This structure naturally groups keys with the same prefix, making prefix queries trivial.",
    "Insertion walks down the trie character by character, creating new nodes when the path does not yet exist, and marks the final node as a word boundary. Search follows the same walk: if every character is found and the final node is marked, the key exists. Deletion unmarks the end flag and optionally prunes nodes that are no longer part of any other key.",
    "The time complexity of all core operations is O(m) where m is the length of the key, regardless of the total number of keys n. This is a significant advantage over balanced BSTs, which require O(m log n) in the worst case because each comparison itself costs O(m) for strings. Hash tables offer O(m) average lookup but cannot efficiently answer prefix queries.",
    "Standard tries can consume considerable memory because each node may allocate space for every possible child character. For example, a node supporting lowercase English letters needs 26 pointers, most of which are often null. This motivates compressed representations: Patricia tries (radix trees) collapse chains of single-child nodes into one edge labelled with the entire substring, dramatically reducing node count.",
    "Tries are foundational in real-world systems: phone contact search, search engine autocomplete, IP longest-prefix-match routing (using bitwise tries), spell checkers, Boggle solvers, and the Aho-Corasick multi-pattern string matching algorithm all rely on trie variants.",
  ],
  deepDive: [
    "A standard trie over an alphabet of size sigma stores n keys of average length L using O(n * L * sigma) space in the worst case, because each node allocates a child array of size sigma. A hash-map-based child representation reduces this to O(n * L) expected space but adds per-lookup constant overhead from hashing. In practice, the choice between array-based and map-based children depends on alphabet size: arrays for small alphabets (DNA with sigma=4, lowercase English with sigma=26), hash maps for Unicode or other large alphabets.",
    "Patricia tries (practical algorithm to retrieve information coded in alphanumeric) and radix trees merge every chain of nodes that have only one child into a single edge labelled with the concatenated substring. This reduces both node count and memory consumption, often by 50-80% on real-world datasets. Insertion and deletion become slightly more complex because edges may need to be split or merged, but the asymptotic time complexity remains O(m). NGINX uses a radix tree for its location matching; the Linux kernel uses compressed tries (called LC-tries) for IP routing.",
    "Ternary search trees (TSTs) provide an alternative that balances trie speed with BST space efficiency. Each TST node stores a single character and three child pointers: left (characters less than), equal (next character in key), and right (characters greater than). TSTs use less space than standard tries when the data is sparse, support all trie operations including prefix search, and can be balanced. However, their worst-case search time is O(m + log n), slightly worse than a standard trie's O(m).",
    "Bitwise tries operate on individual bits rather than characters and are the foundation of longest-prefix-match in IP routing. A 32-bit IPv4 address produces a trie of depth at most 32. Level-compressed tries (LC-tries) further optimize by skipping levels where only one path exists, achieving near-constant-time lookups for real routing tables. The same principle extends to 128-bit IPv6 addresses using multi-bit tries that examine several bits per level to limit tree depth.",
    "The Aho-Corasick algorithm augments a trie with failure links (similar to KMP failure function) and dictionary suffix links to search for multiple patterns simultaneously in O(n + m + z) time, where n is text length, m is total pattern length, and z is the number of matches. This is used in intrusion detection systems (Snort), malware signature scanning, and DNA sequence analysis. Building the automaton requires a BFS traversal to compute failure links, transforming the trie into a finite automaton.",
  ],
  code: [
    {
      language: "python",
      caption: "Standard trie with insert, search, and startsWith",
      source: `class TrieNode:
    def __init__(self):
        self.children = {}       # char -> TrieNode
        self.is_end = False      # marks end of a complete word

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True

    def search(self, word: str) -> bool:
        node = self._find_node(word)
        return node is not None and node.is_end

    def starts_with(self, prefix: str) -> bool:
        return self._find_node(prefix) is not None

    def _find_node(self, prefix: str):
        node = self.root
        for ch in prefix:
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node

# Usage
t = Trie()
for w in ["apple", "app", "apex", "bat", "ball"]:
    t.insert(w)
print(t.search("app"))        # True
print(t.search("ap"))         # False (not a complete word)
print(t.starts_with("ap"))    # True`,
    },
    {
      language: "python",
      caption: "Autocomplete: collect all words with a given prefix",
      source: `def autocomplete(trie: Trie, prefix: str) -> list[str]:
    """Return all words in the trie that start with the given prefix."""
    node = trie._find_node(prefix)
    if node is None:
        return []
    results: list[str] = []
    _dfs(node, list(prefix), results)
    return results

def _dfs(node: 'TrieNode', path: list[str], results: list[str]) -> None:
    if node.is_end:
        results.append("".join(path))
    for ch, child in sorted(node.children.items()):
        path.append(ch)
        _dfs(child, path, results)
        path.pop()

# Usage
t = Trie()
for w in ["car", "card", "care", "careful", "cars", "cat"]:
    t.insert(w)

print(autocomplete(t, "car"))
# ['car', 'card', 'care', 'careful', 'cars']
print(autocomplete(t, "cat"))
# ['cat']
print(autocomplete(t, "cab"))
# []`,
    },
    {
      language: "typescript",
      caption: "Trie implementation in TypeScript with delete support",
      source: `class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEnd: boolean = false;
}

class Trie {
  private root = new TrieNode();

  insert(word: string): void {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) {
        node.children.set(ch, new TrieNode());
      }
      node = node.children.get(ch)!;
    }
    node.isEnd = true;
  }

  search(word: string): boolean {
    const node = this.findNode(word);
    return node !== null && node.isEnd;
  }

  delete(word: string): boolean {
    return this.deleteHelper(this.root, word, 0);
  }

  private deleteHelper(node: TrieNode, word: string, depth: number): boolean {
    if (depth === word.length) {
      if (!node.isEnd) return false;   // word not found
      node.isEnd = false;
      return node.children.size === 0; // prune if leaf
    }
    const ch = word[depth];
    const child = node.children.get(ch);
    if (!child) return false;

    const shouldDeleteChild = this.deleteHelper(child, word, depth + 1);
    if (shouldDeleteChild) {
      node.children.delete(ch);
      return !node.isEnd && node.children.size === 0;
    }
    return false;
  }

  private findNode(prefix: string): TrieNode | null {
    let node: TrieNode = this.root;
    for (const ch of prefix) {
      const child = node.children.get(ch);
      if (!child) return null;
      node = child;
    }
    return node;
  }
}`,
    },
  ],
  diagrams: [
    {
      title: "Trie structure for {app, apple, apex, bat, ball}",
      kind: "architecture",
      caption: "Each node holds a character; paths from root to nodes marked with * spell complete words. Shared prefixes (a-p-p, b-a) are stored once.",
    },
    {
      title: "Trie insert operation flow",
      kind: "flow",
      caption: "Walk the trie character by character: if the child exists follow it, otherwise create a new node. Mark the final node as end-of-word.",
    },
    {
      title: "Standard trie vs radix tree compression",
      kind: "architecture",
      caption: "Shows how single-child chains in a standard trie collapse into single edges with multi-character labels in a radix tree, reducing node count.",
    },
  ],
  animations: [
    {
      title: "Inserting 'apple' into an empty trie",
      steps: [
        { label: "Start at root", detail: "The root node exists but has no children." },
        { label: "Insert 'a'", detail: "No child 'a' at root, so create a new node and add edge 'a'." },
        { label: "Insert 'p'", detail: "No child 'p' at node 'a', create node, add edge 'p'." },
        { label: "Insert second 'p'", detail: "No child 'p' at first 'p' node, create another node." },
        { label: "Insert 'l'", detail: "No child 'l' at second 'p' node, create node." },
        { label: "Insert 'e'", detail: "No child 'e' at 'l' node, create node." },
        { label: "Mark end", detail: "Set is_end = true on the 'e' node. The path root->a->p->p->l->e now spells 'apple'." },
      ],
    },
    {
      title: "Searching for 'app' then 'apex'",
      steps: [
        { label: "Search 'app': start at root", detail: "Begin traversal from the root node." },
        { label: "Follow 'a'", detail: "Child 'a' exists at root, move to it." },
        { label: "Follow first 'p'", detail: "Child 'p' exists, move to it." },
        { label: "Follow second 'p'", detail: "Child 'p' exists, move to it. All characters consumed." },
        { label: "Check is_end", detail: "If 'app' was inserted, is_end is true and search returns true. Otherwise false (prefix exists but not as a stored word)." },
        { label: "Search 'apex': follow a->p", detail: "Same path as before through 'a' and first 'p'." },
        { label: "Follow 'e'", detail: "At the first 'p' node, look for child 'e'. If it exists, follow it." },
        { label: "Follow 'x'", detail: "At node 'e', follow child 'x'. Check is_end on arrival." },
      ],
    },
  ],
  comparison: {
    columns: ["Property", "Standard Trie", "Compressed Trie (Radix Tree)", "Ternary Search Tree"],
    rows: [
      ["Space per node", "O(sigma) child pointers", "O(sigma) but far fewer nodes", "3 pointers + 1 char"],
      ["Total space", "O(n * L * sigma)", "O(n * sigma) typical", "O(n * L)"],
      ["Search time", "O(m)", "O(m)", "O(m + log n) worst"],
      ["Insert time", "O(m)", "O(m) with edge splitting", "O(m + log n) worst"],
      ["Prefix search", "Natural, O(p + k)", "Natural, O(p + k)", "Supported, O(p + log n + k)"],
      ["Implementation complexity", "Simple", "Moderate (edge splitting/merging)", "Moderate (three-way branching)"],
      ["Best for", "Small alphabets, dense key sets", "Sparse keys, long shared prefixes", "Large alphabets, memory-constrained"],
      ["Real-world usage", "Autocomplete, spell check", "IP routing, NGINX location matching", "Dictionary lookup, spell check"],
    ],
  },
  interviewQA: [
    {
      q: "Implement a trie that supports insert, search, and startsWith. What are the time and space complexities?",
      a: "Each operation walks the trie character by character, creating or following nodes. Insert and search are both O(m) where m is the word length. startsWith is identical to search but does not check the end-of-word flag. Space is O(N * m) where N is the number of words and m is average length, using hash-map children. With array children of size sigma, each node costs O(sigma).",
      followUps: [
        "How would you modify the trie to count the number of words with a given prefix?",
        "How would you implement delete?",
      ],
    },
    {
      q: "How would you implement an autocomplete system using a trie?",
      a: "Insert all dictionary words into a trie. When the user types a prefix, traverse to the node representing that prefix, then perform a DFS/BFS from that node to collect all words. To return the top-k most popular completions, store a frequency at each end-of-word node and either sort the DFS results or maintain a min-heap of size k during traversal. For very large dictionaries, pre-compute the top-k completions at each node during build time.",
      followUps: [
        "How would you handle ranking by recency as well as frequency?",
        "What data structure would you use if the dictionary changes frequently?",
        "How does Google's autocomplete likely differ from this naive approach?",
      ],
    },
    {
      q: "What is the difference between a trie and a radix tree? When would you prefer one over the other?",
      a: "A radix tree (compressed trie or Patricia trie) merges chains of single-child nodes into single edges labelled with entire substrings. This reduces the number of internal nodes dramatically when keys share long prefixes or the tree is sparse. Prefer a standard trie when the alphabet is small and the key set is dense (most branches are actually used). Prefer a radix tree when keys are long, sparse, or the alphabet is large, such as in IP routing or URL path matching.",
      followUps: [
        "How does edge splitting work during insertion in a radix tree?",
        "What is the space complexity improvement?",
      ],
    },
    {
      q: "Design a spell checker using a trie. How would you suggest corrections for a misspelled word?",
      a: "Insert all valid dictionary words into the trie. For a misspelled word, use a recursive DFS that tracks edit distance (Levenshtein distance), pruning branches where the remaining budget is exhausted. At each trie node, consider four operations: match (no cost if characters are equal), substitution (cost 1), insertion into the word (cost 1), and deletion from the word (cost 1). Collect all dictionary words reachable within edit distance k (typically 1 or 2). This is essentially a simultaneous traversal of the trie and the input word, similar to the approach in Norvig's spell corrector but leveraging the trie structure for pruning.",
      followUps: [
        "What is the time complexity of this approach?",
        "How would you rank the suggested corrections?",
      ],
    },
    {
      q: "How does longest prefix matching work in IP routing using a trie?",
      a: "Each IP address is treated as a sequence of bits. A bitwise trie is built from all routing-table entries, where each node has at most two children (0 and 1). To find the route for a destination IP, traverse the trie bit by bit from the most significant bit. At each node that is marked as a valid prefix (a routing entry), record it as the current best match. When the traversal ends (no more matching children or all bits consumed), return the last recorded match. This is the longest prefix match. Multi-bit tries examine several bits at each level to reduce tree depth at the cost of more children per node.",
      followUps: [
        "What is an LC-trie and how does it improve lookup speed?",
        "How would you handle incremental updates to the routing table?",
      ],
    },
    {
      q: "Given a list of words, find all pairs where one word is a prefix of another. How would you solve this efficiently with a trie?",
      a: "Insert all words into a trie, storing the word index at each end-of-word node. Then for each word, traverse the trie character by character. Every time you pass through a node marked as end-of-word (and it is not the current word itself), you have found a word that is a prefix of the current word. This runs in O(N * L) time where N is the number of words and L is the average length, which is optimal since you must read all input.",
      followUps: [
        "How would you extend this to find all pairs where concatenation of two words forms another word in the list?",
      ],
    },
  ],
  followUps: [
    "How does the Aho-Corasick algorithm extend tries for multi-pattern matching?",
    "What is a suffix trie, and how does it relate to suffix trees and suffix arrays?",
    "How would you serialize and deserialize a trie for persistent storage?",
    "What are the trade-offs between using a trie vs a hash map for dictionary lookup?",
    "How do modern databases use trie-like structures (e.g., ART - Adaptive Radix Tree)?",
  ],
  mcqs: [
    {
      q: "What is the time complexity of searching for a word of length m in a trie containing n words?",
      options: ["O(n)", "O(m)", "O(m log n)", "O(n * m)"],
      answerIndex: 1,
      explanation: "Trie search follows one edge per character. The traversal length depends only on the word length m, not on the total number of stored words n.",
    },
    {
      q: "In a standard trie over lowercase English letters, how many child pointers does each node allocate?",
      options: ["2", "26", "52", "256"],
      answerIndex: 1,
      explanation: "Each node needs one pointer per possible character. For lowercase English (a-z), that is 26. This is why standard tries can be memory-heavy for large alphabets.",
    },
    {
      q: "What distinguishes a radix tree (Patricia trie) from a standard trie?",
      options: [
        "It uses a balanced BST at each node",
        "It compresses chains of single-child nodes into one edge with a multi-character label",
        "It only supports binary alphabets",
        "It stores keys in sorted leaf nodes like a B-tree",
      ],
      answerIndex: 1,
      explanation: "A radix tree merges every node that has only one child with its parent, labelling the resulting edge with the concatenated characters. This dramatically reduces node count.",
    },
    {
      q: "Which operation is NOT efficiently supported by a trie?",
      options: [
        "Finding all words with a given prefix",
        "Checking if a word exists",
        "Finding the k-th lexicographically smallest word",
        "Finding the longest common prefix of all stored words",
      ],
      answerIndex: 2,
      explanation: "Finding the k-th smallest word requires knowing subtree sizes at each node, which are not maintained by default. The other operations are natural strengths of a trie.",
    },
    {
      q: "A ternary search tree (TST) node has how many child pointers?",
      options: ["2", "3", "26", "Varies with alphabet size"],
      answerIndex: 1,
      explanation: "A TST node has exactly three child pointers: left (less than), equal (match, go to next character), and right (greater than). This is independent of alphabet size, which is the TST's space advantage.",
    },
    {
      q: "In IP routing, longest prefix match is performed using which type of trie?",
      options: ["Character trie", "Bitwise trie", "Ternary search tree", "Suffix trie"],
      answerIndex: 1,
      explanation: "IP addresses are sequences of bits. A bitwise trie (each node has children for 0 and 1) naturally supports longest prefix matching by walking the trie bit by bit and recording the last valid routing entry seen.",
    },
  ],
  exercises: [
    "Implement a Trie class with insert, search, startsWith, and delete methods. Ensure delete properly prunes unnecessary nodes.",
    "Given a list of words, write a function to return the longest common prefix using a trie. Walk down the trie while each node has exactly one child and is not an end-of-word marker.",
    "Build an autocomplete system: insert a dictionary into a trie, then given a prefix, return all matching words sorted lexicographically. Extend it to return only the top-k by frequency.",
    "Implement a word search on a 2D board of characters (LeetCode 212): use a trie to store all target words, then DFS from each cell, walking the trie simultaneously to prune impossible paths early.",
    "Implement a radix tree that supports insert and search. Handle edge splitting on insert and verify that single-child chains are always compressed.",
    "Design a spell checker: given a dictionary in a trie, find all words within edit distance 2 of a query word. Use the trie structure to prune the search space.",
    "Solve the 'Map Sum Pairs' problem (LeetCode 677): design a trie where each node tracks the sum of values of all keys that pass through it, supporting insert(key, val) and sum(prefix) in O(m) time.",
  ],
  flashcards: [
    { front: "What is a trie?", back: "A tree data structure where each node represents a character and paths from root to marked nodes spell stored strings. Also called a prefix tree." },
    { front: "Time complexity of trie insert/search/delete?", back: "O(m) where m is the length of the key. Independent of the total number of keys stored." },
    { front: "What makes tries better than hash maps for prefix queries?", back: "Hash maps require checking every key to find prefix matches (O(n*m)). Tries naturally group keys by prefix, answering prefix queries in O(p + k) where p is prefix length and k is the number of matches." },
    { front: "What is a radix tree (Patricia trie)?", back: "A compressed trie that merges single-child chains into edges labelled with entire substrings. Dramatically reduces node count for sparse key sets." },
    { front: "What is a ternary search tree (TST)?", back: "A trie variant where each node has three children: left (char <), equal (char matches, advance), right (char >). Uses less space than standard tries for large alphabets." },
    { front: "How does longest prefix match work in IP routing?", back: "Build a bitwise trie from routing entries. Walk the trie bit-by-bit for a destination IP, recording the last valid routing entry seen. Return that entry as the best match." },
    { front: "Space complexity of a standard trie?", back: "O(n * L * sigma) in the worst case, where n = number of keys, L = average key length, sigma = alphabet size. Each node allocates sigma child pointers." },
    { front: "What is the Aho-Corasick algorithm?", back: "A multi-pattern string matching algorithm that augments a trie with failure links and dictionary suffix links, enabling simultaneous search for all patterns in O(n + m + z) time." },
    { front: "How do you delete a word from a trie?", back: "Unmark the end-of-word flag at the terminal node. If the node has no children, prune it and recurse upward, removing any ancestors that are now childless and not end-of-word." },
    { front: "What is the key advantage of a trie over a balanced BST for string keys?", back: "BST comparisons cost O(m) each, giving O(m log n) search. Trie search is O(m) regardless of n, because each character is examined exactly once." },
  ],
  revisionNotes: [
    "A trie is a tree where each edge represents a character; paths spell stored strings.",
    "Core operations (insert, search, delete) are all O(m) where m = key length.",
    "Tries natively support prefix queries, which hash maps and BSTs cannot do efficiently.",
    "Standard tries waste space with sparse child arrays; use hash-map children or compressed tries to mitigate.",
    "Radix trees compress single-child chains into multi-character edges, reducing nodes dramatically.",
    "Ternary search trees use 3 pointers per node regardless of alphabet size, trading speed for space.",
    "Bitwise tries support longest-prefix-match for IP routing in O(W) time where W = address width.",
    "Aho-Corasick = trie + failure links for multi-pattern matching in linear time.",
    "Common interview patterns: autocomplete, word search on 2D grid, prefix counting, spell checking.",
  ],
  cheatSheet: [
    "Trie node: children map + is_end boolean (optionally a value for map-like tries).",
    "Insert: walk trie char by char, create missing nodes, mark final node as end.",
    "Search: walk trie char by char; return true only if all chars found AND final node is marked end.",
    "Prefix check (startsWith): same as search but skip the is_end check.",
    "Delete: unmark end flag; prune upward if node is now a childless non-end node.",
    "Autocomplete: find prefix node, then DFS/BFS to collect all words in that subtree.",
    "Space optimization: use hash map children instead of fixed-size arrays for large alphabets.",
    "Radix tree: merge single-child chains into one edge; split edges on insert when partial match.",
    "Count words with prefix: store a pass-through counter at each node, incremented during insert.",
    "Longest common prefix of all words: walk trie from root while node has exactly one child and is not end.",
  ],
  resources: [
    { label: "LeetCode 208 - Implement Trie (Prefix Tree)", kind: "docs", note: "The canonical trie implementation problem." },
    { label: "LeetCode 212 - Word Search II", kind: "docs", note: "Classic trie + DFS backtracking on a 2D board." },
    { label: "Algorithms, 4th Edition by Sedgewick & Wayne - Chapter 5.2: Tries", kind: "book", note: "Covers R-way tries, TSTs, and character-based string symbol tables." },
    { label: "Introduction to Algorithms (CLRS) - Chapter 12 supplement on tries", kind: "book", note: "Theoretical foundations and analysis of trie data structures." },
    { label: "Aho & Corasick, 'Efficient String Matching: An Aid to Bibliographic Search' (1975)", kind: "paper", note: "The original paper on multi-pattern matching using trie automata." },
    { label: "Nilsson & Karlsson, 'IP-Address Lookup Using LC-Tries' (1999)", kind: "paper", note: "Level-compressed tries for high-performance IP routing." },
    { label: "Trie Data Structure - Abdul Bari (YouTube)", kind: "video", note: "Clear visual walkthrough of trie operations and complexity analysis." },
    { label: "google/btree - Go B-tree and trie implementations", kind: "repo", note: "Production-quality trie-related data structures." },
  ],
  glossary: [
    { term: "Trie", definition: "A tree-based data structure for storing strings where each node represents a character and shared prefixes are stored once. Also called a prefix tree or digital tree." },
    { term: "Prefix tree", definition: "Another name for a trie, emphasizing its ability to efficiently handle prefix-based queries." },
    { term: "Radix tree", definition: "A compressed trie that collapses single-child chains into edges labelled with substrings, reducing node count." },
    { term: "Patricia trie", definition: "Practical Algorithm To Retrieve Information Coded In Alphanumeric. A type of radix tree originally designed for binary alphabets." },
    { term: "Ternary search tree (TST)", definition: "A trie variant where each node has three children (less, equal, greater) instead of an array of all alphabet characters, saving space for large alphabets." },
    { term: "End-of-word marker", definition: "A boolean flag at a trie node indicating that the path from root to this node forms a complete stored key." },
    { term: "Longest prefix match", definition: "Finding the stored key that is the longest prefix of a given query. Used in IP routing to match destination addresses to routes." },
    { term: "Aho-Corasick automaton", definition: "A finite automaton built from a trie augmented with failure links, enabling simultaneous matching of multiple patterns in a text in linear time." },
    { term: "Failure link", definition: "In the Aho-Corasick automaton, a pointer from a node to the longest proper suffix of that node's string that is also a prefix in the trie." },
    { term: "Edge splitting", definition: "In a radix tree, the operation of breaking an existing edge into two when a new key diverges partway along that edge's label." },
  ],
};
