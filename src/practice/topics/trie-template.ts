import type { TopicPractice } from "../types";

export const practice: TopicPractice = {
  questions: [
    {
      name: "Implement Trie (Prefix Tree)",
      difficulty: "Easy",
      variation: "Character trie, template",
      link: "https://leetcode.com/problems/implement-trie-prefix-tree/",
      question: [
        "Design a trie (prefix tree) that stores lowercase-letter strings and supports three operations. insert(word) adds word to the structure. search(word) returns true if word was inserted earlier. startsWith(prefix) returns true if some inserted word has prefix as a prefix.",
        "Example 1:\nInput: insert('apple'), search('apple'), search('app'), startsWith('app'), insert('app'), search('app')\nOutput: -, true, false, true, -, true\nExplanation: After only 'apple' is inserted, 'app' is a prefix of a stored word but is not itself a stored word, so search returns false while startsWith returns true. Once 'app' is inserted it becomes a stored word too.",
        "Example 2:\nInput: insert('ab'), search('abc'), startsWith('abc')\nOutput: -, false, false\nExplanation: Walking 'a' then 'b' succeeds but there is no child 'c', so both queries fail.",
        "Constraints:\n- 1 <= word.length, prefix.length <= 2000\n- word and prefix consist only of lowercase English letters\n- At most 3 * 10^4 calls in total",
      ],
      code: `class Trie {
    struct Node {
        Node* nxt[26] = {};   // one slot per letter, null when absent
        bool word = false;    // true only at the last character of an inserted word
    };
    Node* root;
public:
    Trie() { root = new Node(); }

    void insert(string word) {
        Node* cur = root;
        for (char ch : word) {
            int c = ch - 'a';
            if (!cur->nxt[c]) cur->nxt[c] = new Node();
            cur = cur->nxt[c];
        }
        cur->word = true;
    }

    Node* walk(const string& s) {
        Node* cur = root;
        for (char ch : s) {
            int c = ch - 'a';
            if (!cur->nxt[c]) return nullptr;
            cur = cur->nxt[c];
        }
        return cur;
    }

    bool search(string word) {
        Node* n = walk(word);
        return n != nullptr && n->word;
    }

    bool startsWith(string prefix) {
        return walk(prefix) != nullptr;
    }
};`,
      explanation: [
        "The state is a node, and a node stands for exactly one string: the sequence of edge labels on the unique path from the root down to it. So descending one child is the same as appending one character, and the whole structure shares a single physical path among all words with a common prefix.",
        "The one design decision that matters is separating 'this node exists' from 'this node ends a word'. Existence answers startsWith; the word flag answers search. Collapsing them into one boolean is the classic bug - it makes search('app') return true after inserting only 'apple'.",
        "The tempting wrong shortcut is a hash set of strings. It answers search in O(L) just as well, but it cannot answer startsWith or any prefix aggregate without scanning every stored key, which is the whole point of the trie.",
        "For a fixed small alphabet the 26-pointer array is the right layout: O(1) child lookup with no hashing. For large or sparse alphabets swap it for a hash map per node, trading constant factor for memory.",
        "Time: O(L) per operation, where L is the length of the string. Space: O(total characters inserted * 26).",
      ],
    },
    {
      name: "Replace Words",
      difficulty: "Medium",
      variation: "Shortest matching prefix (root) lookup",
      link: "https://leetcode.com/problems/replace-words/",
      question: [
        "In English a word can be formed from a root plus a successor, for example 'help' plus 'ful' gives 'helpful'. You are given a dictionary of roots and a sentence of space-separated lowercase words. Replace every word in the sentence that has a root in the dictionary as a prefix by that root. If a word can be replaced by more than one root, use the shortest one. Return the resulting sentence.",
        "Example 1:\nInput: dictionary = ['cat','bat','rat'], sentence = 'the cattle was rattled by the battery'\nOutput: 'the cat was rat by the bat'\nExplanation: 'cattle' starts with the root 'cat', 'rattled' with 'rat', 'battery' with 'bat'. 'the', 'was' and 'by' have no root prefix and stay as they are.",
        "Example 2:\nInput: dictionary = ['ab'], sentence = 'abc abd zz'\nOutput: 'ab ab zz'\nExplanation: Both 'abc' and 'abd' begin with 'ab'; 'zz' has no matching root.",
        "Constraints:\n- 1 <= dictionary.length <= 1000\n- 1 <= dictionary[i].length <= 100\n- 1 <= sentence.length <= 10^6\n- sentence contains only lowercase letters and single spaces",
      ],
      code: `string replaceWords(vector<string>& dictionary, string sentence) {
    vector<array<int,26>> nxt(1);
    nxt[0].fill(-1);
    vector<char> isRoot(1, 0);
    for (auto& w : dictionary) {
        int cur = 0;
        for (char ch : w) {
            int c = ch - 'a';
            if (nxt[cur][c] == -1) {
                nxt[cur][c] = (int)nxt.size();
                nxt.push_back(array<int,26>());
                nxt.back().fill(-1);
                isRoot.push_back(0);
            }
            cur = nxt[cur][c];
        }
        isRoot[cur] = 1;
    }
    string res, word;
    stringstream ss(sentence);
    while (ss >> word) {
        int cur = 0;
        string best;
        for (int i = 0; i < (int)word.size(); i++) {
            int c = word[i] - 'a';
            if (nxt[cur][c] == -1) break;
            cur = nxt[cur][c];
            if (isRoot[cur]) {           // first root hit going down is the shortest one
                best = word.substr(0, i + 1);
                break;
            }
        }
        if (!res.empty()) res += ' ';
        res += best.empty() ? word : best;
    }
    return res;
}`,
      explanation: [
        "Walking a word down the trie visits its prefixes in strictly increasing length. Therefore the first node marked as a root is the shortest root that is a prefix of the word, and the search can stop the instant it is found - no comparison of candidate lengths is needed.",
        "The walk also self-terminates: if some prefix has no child for the next character, no longer prefix can be in the dictionary either, because a trie only stores a node when some inserted word passes through it.",
        "The brute force is to test every root against every word, which is O(number of words * dictionary size * root length) - around 10^6 * 1000 here, far too slow. The trie folds all 1000 roots into a single pass over each word.",
        "Nodes are stored in a flat vector rather than as heap-allocated objects. That keeps children contiguous and avoids a million small allocations; the index -1 plays the role of a null pointer. Note that the child slot is assigned before push_back, so a reallocation cannot invalidate anything.",
        "Time: O(D + S), where D is the total length of the dictionary and S the length of the sentence. Space: O(D * 26).",
      ],
    },
    {
      name: "Map Sum Pairs",
      difficulty: "Medium",
      variation: "Prefix aggregate stored on nodes",
      link: "https://leetcode.com/problems/map-sum-pairs/",
      question: [
        "Design a structure mapping string keys to integer values with two operations. insert(key, val) stores val under key, overwriting any previous value for that exact key. sum(prefix) returns the total of the values of all keys that start with prefix.",
        "Example 1:\nInput: insert('apple', 3), sum('ap'), insert('app', 2), sum('ap')\nOutput: -, 3, -, 5\nExplanation: After the first insert only 'apple' starts with 'ap', giving 3. After inserting 'app' with value 2 both keys start with 'ap', giving 3 + 2 = 5.",
        "Example 2:\nInput: insert('a', 4), sum('a'), insert('a', 10), sum('a')\nOutput: -, 4, -, 10\nExplanation: The second insert overwrites the value of key 'a' rather than adding to it, so the prefix sum becomes 10, not 14.",
        "Constraints:\n- 1 <= key.length, prefix.length <= 50\n- key and prefix consist of lowercase English letters\n- 1 <= val <= 1000\n- At most 50 calls in total",
      ],
      code: `class MapSum {
    struct Node {
        Node* nxt[26] = {};
        int sum = 0;          // total value of every key passing through this node
    };
    Node* root;
    unordered_map<string,int> val;   // remembers the current value of each exact key
public:
    MapSum() { root = new Node(); }

    void insert(string key, int v) {
        int delta = v - val[key];    // overwriting adjusts by the difference, not by v
        val[key] = v;
        Node* cur = root;
        for (char ch : key) {
            int c = ch - 'a';
            if (!cur->nxt[c]) cur->nxt[c] = new Node();
            cur = cur->nxt[c];
            cur->sum += delta;
        }
    }

    int sum(string prefix) {
        Node* cur = root;
        for (char ch : prefix) {
            int c = ch - 'a';
            if (!cur->nxt[c]) return 0;
            cur = cur->nxt[c];
        }
        return cur->sum;
    }
};`,
      explanation: [
        "The invariant is that node.sum equals the sum of the values of all keys whose path passes through that node - that is, all keys having this node's string as a prefix. Under that invariant sum(prefix) is a single O(L) walk that reads one number, with no subtree traversal at all.",
        "Maintaining the invariant on insert means adding the same delta to every node on the key's path, since exactly those nodes have the key in their subtree. Nodes off the path are untouched.",
        "The trap is the overwrite rule. Adding v along the path is correct only for a brand new key; re-inserting an existing key must add v minus its old value. Keeping a side map of exact key values is the cheapest way to compute that delta, and the alternative - storing the value at the terminal node and reading it before updating - works equally well.",
        "The other tempting design is to store nothing on internal nodes and DFS the subtree under prefix at query time. That is correct but turns an O(L) query into one proportional to the size of the subtree, and it is strictly worse whenever queries outnumber inserts.",
        "Time: O(L) per insert and per sum. Space: O(total key characters * 26).",
      ],
    },
    {
      name: "Design Add and Search Words Data Structure",
      difficulty: "Medium",
      variation: "Wildcard search with backtracking",
      link: "https://leetcode.com/problems/design-add-and-search-words-data-structure/",
      question: [
        "Design a structure supporting addWord(word) and search(word). addWord stores a lowercase word. search(word) returns true if some stored word matches, where the pattern may contain the character '.' which matches any single letter. The match must cover the whole stored word, not a prefix of it.",
        "Example 1:\nInput: addWord('bad'), addWord('dad'), addWord('mad'), search('pad'), search('bad'), search('.ad'), search('b..')\nOutput: -, -, -, false, true, true, true\nExplanation: 'pad' was never added. '.ad' matches 'bad', 'dad' and 'mad'. 'b..' matches 'bad'.",
        "Example 2:\nInput: addWord('a'), search('.'), search('..')\nOutput: -, true, false\nExplanation: A single dot matches the one-letter word 'a'; two dots require a stored word of length two, and there is none.",
        "Constraints:\n- 1 <= word.length <= 25\n- addWord uses only lowercase English letters\n- search uses lowercase English letters and '.'\n- At most 10^4 calls, and at most 3 dots in any search string",
      ],
      code: `class WordDictionary {
    struct Node {
        Node* nxt[26] = {};
        bool word = false;
    };
    Node* root;

    bool dfs(Node* cur, const string& s, int i) {
        if (!cur) return false;
        if (i == (int)s.size()) return cur->word;
        if (s[i] != '.') return dfs(cur->nxt[s[i] - 'a'], s, i + 1);
        for (int c = 0; c < 26; c++) {          // a dot forks into every existing child
            if (cur->nxt[c] && dfs(cur->nxt[c], s, i + 1)) return true;
        }
        return false;
    }
public:
    WordDictionary() { root = new Node(); }

    void addWord(string word) {
        Node* cur = root;
        for (char ch : word) {
            int c = ch - 'a';
            if (!cur->nxt[c]) cur->nxt[c] = new Node();
            cur = cur->nxt[c];
        }
        cur->word = true;
    }

    bool search(string word) { return dfs(root, word, 0); }
};`,
      explanation: [
        "The state is a pair (node, position in the pattern), meaning 'the first i pattern characters have been matched and we currently sit at this node'. A concrete letter advances that state deterministically; a dot makes it branch over up to 26 successor states.",
        "Depth is bounded by the pattern length, so the recursion is a plain DFS over the trie restricted to paths consistent with the pattern. Returning cur->word at the end - not simply true - is what enforces a full-length match instead of a prefix match.",
        "Because the trie only materialises nodes that lie on some inserted word, a dot never explores letters that no stored word actually uses. That is why this beats matching the pattern against every stored word: the shared prefixes prune whole families of candidates at once.",
        "The cost blows up with the number of dots: d dots give up to 26^d branches, which is why the constraint caps them at three. A leading run of dots is the worst case, since almost nothing has been pinned down yet; if unbounded wildcards were allowed you would instead bucket words by length and fall back to per-length matching.",
        "Time: O(L) per search with no dots, up to O(26^d * L) with d dots. Space: O(total characters * 26).",
      ],
    },
    {
      name: "Search Suggestions System",
      difficulty: "Medium",
      variation: "Autocomplete, top-k per node",
      link: "https://leetcode.com/problems/search-suggestions-system/",
      question: [
        "You are given an array of product names and a string searchWord. As the user types searchWord one character at a time, after each character suggest at most three products from the array that share the typed prefix. If more than three products share it, return the three that are lexicographically smallest. Return a list of lists of suggestions, one entry per typed character.",
        "Example 1:\nInput: products = ['mobile','mouse','moneypot','monitor','mousepad'], searchWord = 'mouse'\nOutput: [['mobile','moneypot','monitor'],['mobile','moneypot','monitor'],['mouse','mousepad'],['mouse','mousepad'],['mouse','mousepad']]\nExplanation: Sorted, the products are mobile, moneypot, monitor, mouse, mousepad. All five share 'm' and 'mo', so the first three sorted names are suggested. Only mouse and mousepad share 'mou', 'mous' and 'mouse'.",
        "Example 2:\nInput: products = ['havana'], searchWord = 'havana'\nOutput: [['havana'],['havana'],['havana'],['havana'],['havana'],['havana']]\nExplanation: The single product matches every prefix of the search word.",
        "Constraints:\n- 1 <= products.length <= 1000\n- 1 <= products[i].length <= 3000\n- 1 <= searchWord.length <= 1000\n- All strings consist of lowercase English letters",
      ],
      code: `vector<vector<string>> suggestedProducts(vector<string>& products, string searchWord) {
    sort(products.begin(), products.end());
    struct Node {
        int nxt[26];
        vector<int> top;    // indices of the <= 3 smallest products under this node
    };
    vector<Node> t(1);
    for (int i = 0; i < 26; i++) t[0].nxt[i] = -1;
    for (int i = 0; i < (int)products.size(); i++) {
        int cur = 0;
        for (char ch : products[i]) {
            int c = ch - 'a';
            if (t[cur].nxt[c] == -1) {
                t[cur].nxt[c] = (int)t.size();
                Node nd;
                for (int j = 0; j < 26; j++) nd.nxt[j] = -1;
                t.push_back(nd);
            }
            cur = t[cur].nxt[c];
            if ((int)t[cur].top.size() < 3) t[cur].top.push_back(i);   // insertion order is sorted order
        }
    }
    vector<vector<string>> res;
    int cur = 0;
    bool dead = false;
    for (char ch : searchWord) {
        int c = ch - 'a';
        if (!dead && t[cur].nxt[c] != -1) cur = t[cur].nxt[c];
        else dead = true;
        vector<string> now;
        if (!dead) {
            for (int id : t[cur].top) now.push_back(products[id]);
        }
        res.push_back(now);
    }
    return res;
}`,
      explanation: [
        "Sort the products once, then insert them in that order. Now the first three products that touch a node are precisely the three lexicographically smallest products in its subtree, so each node can cache its own answer during construction and every query becomes a single pointer hop plus a copy of at most three strings.",
        "This works only because sorted insertion order and lexicographic order agree; if products arrived unsorted you would need a bounded priority structure per node, or a subtree DFS at query time.",
        "Once a typed character has no matching child, every longer prefix is also absent - that is the dead flag. Forgetting it and continuing to walk from a stale node is the standard bug here, producing suggestions for prefixes that do not exist.",
        "Worth knowing: sorting plus two binary searches per prefix solves this problem in fewer lines and is what most people write in an interview. The trie version is the one that generalises to a live, incrementally updated product catalogue and to top-k by popularity rather than by name.",
        "Time: O(P log P + P * L + Q * 3), where P is the number of products, L the average length and Q the search word length. Space: O(total product characters * 26).",
      ],
    },
    {
      name: "Maximum XOR of Two Numbers in an Array",
      difficulty: "Medium",
      variation: "Binary trie, max XOR pair",
      link: "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/",
      question: [
        "Given an integer array nums, return the maximum value of nums[i] XOR nums[j] over all pairs of indices i and j.",
        "Example 1:\nInput: nums = [3,10,5,25,2,8]\nOutput: 28\nExplanation: 5 XOR 25 = 00101 XOR 11001 = 11100 = 28, and no other pair does better.",
        "Example 2:\nInput: nums = [2,4]\nOutput: 6\nExplanation: 010 XOR 100 = 110 = 6.",
        "Constraints:\n- 1 <= nums.length <= 2 * 10^5\n- 0 <= nums[i] < 2^31",
      ],
      code: `int findMaximumXOR(vector<int>& nums) {
    const int B = 31;                       // bits 30..0 cover every value below 2^31
    vector<array<int,2>> t(1, {-1, -1});
    auto insert = [&](int x) {
        int cur = 0;
        for (int b = B - 1; b >= 0; b--) {
            int d = (x >> b) & 1;
            if (t[cur][d] == -1) { t[cur][d] = (int)t.size(); t.push_back({-1, -1}); }
            cur = t[cur][d];
        }
    };
    auto query = [&](int x) {
        int cur = 0, res = 0;
        for (int b = B - 1; b >= 0; b--) {
            int d = (x >> b) & 1;
            if (t[cur][1 - d] != -1) {      // opposite bit gives a 1 in the xor, always preferable
                res |= 1 << b;
                cur = t[cur][1 - d];
            } else {
                cur = t[cur][d];
            }
        }
        return res;
    };
    insert(nums[0]);
    int ans = 0;
    for (int i = 1; i < (int)nums.size(); i++) {
        ans = max(ans, query(nums[i]));
        insert(nums[i]);
    }
    return ans;
}`,
      explanation: [
        "Treat each number as a fixed-width bit string and store it in a binary trie from the most significant bit down. A node then represents a set of numbers sharing a bit prefix, and depth b partitions the array by its top B - b bits.",
        "The greedy is correct by place value: a 1 at bit b outweighs every possible combination of the lower b bits, since 2^b > 2^b - 1. So at each level, if any stored number has the bit opposite to x, following it is optimal no matter what happens below, and the trie tells us in O(1) whether such a number exists.",
        "Inserting before querying is what avoids pairing a number with itself and what makes the scan cover every unordered pair exactly once: when nums[i] is queried, the trie holds exactly nums[0..i-1].",
        "The wrong-but-tempting approach is the O(n^2) double loop - fine for 2000 elements, hopeless for 2 * 10^5. The other standard solution builds the answer bit by bit with a hash set of masked prefixes; it is the same greedy with the trie replaced by hashing.",
        "Time: O(n * B). Space: O(n * B).",
      ],
    },
    {
      name: "Word Combinations",
      difficulty: "Medium",
      variation: "Trie plus linear DP over the string",
      link: "https://cses.fi/problemset/task/1731",
      question: [
        "You are given a string of length n and a dictionary of k words. Count the number of ways the string can be created by concatenating dictionary words. Words may be reused any number of times. Print the count modulo 10^9 + 7. The first input line is the string, the second is k, and the next k lines are the words.",
        "Example 1:\nInput:\nababc\n4\nab\nabab\nc\ncb\nOutput: 2\nExplanation: The string can be split as ab + ab + c or as abab + c. No other combination of dictionary words spells ababc.",
        "Example 2:\nInput:\naaa\n2\na\naa\nOutput: 3\nExplanation: a+a+a, a+aa and aa+a.",
        "Constraints:\n- 1 <= n <= 5000\n- 1 <= k <= 10^5\n- The total length of the words is at most 10^6\n- All strings consist of lowercase English letters",
      ],
      code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    int k;
    cin >> s >> k;
    vector<array<int,26>> nxt(1);
    nxt[0].fill(-1);
    vector<char> isEnd(1, 0);
    for (int i = 0; i < k; i++) {
        string w;
        cin >> w;
        int cur = 0;
        for (char ch : w) {
            int c = ch - 'a';
            if (nxt[cur][c] == -1) {
                nxt[cur][c] = (int)nxt.size();
                nxt.push_back(array<int,26>());
                nxt.back().fill(-1);
                isEnd.push_back(0);
            }
            cur = nxt[cur][c];
        }
        isEnd[cur] = 1;
    }
    const long long MOD = 1000000007LL;
    int n = s.size();
    vector<long long> dp(n + 1, 0);
    dp[0] = 1;
    for (int i = 0; i < n; i++) {
        if (dp[i] == 0) continue;           // position i is unreachable, nothing to propagate
        int cur = 0;
        for (int j = i; j < n; j++) {
            int c = s[j] - 'a';
            if (nxt[cur][c] == -1) break;   // no dictionary word extends past here
            cur = nxt[cur][c];
            if (isEnd[cur]) dp[j + 1] = (dp[j + 1] + dp[i]) % MOD;
        }
    }
    cout << dp[n] << "\\n";
    return 0;
}`,
      explanation: [
        "dp[i] is the number of ways to spell the first i characters of s exactly. dp[0] = 1 for the empty prefix, and the answer is dp[n].",
        "The transition needs, for a given start i, every dictionary word that occurs in s starting at i. Walking s[i..] down the trie enumerates exactly those in one pass: each step consumes one character, and every terminal node hit along the way is one such word. The walk stops the moment no word shares the current prefix, so a start position costs only as much as the longest dictionary word matching there.",
        "The trap is trying dp[i] = sum over words of dp[i - len(word)] with a direct substring compare per word. That is O(n * k * word length) - up to 5000 * 10^5 comparisons - and it re-reads the same characters once per word. The trie shares that work across all words with a common prefix.",
        "The skip when dp[i] is zero is not just an optimisation of the count; positions that cannot be reached must not seed forward transitions at all, or dp would count splits of suffixes that never attach to a real prefix. Adding zero happens to be harmless here, but the guard makes the intent explicit and cuts the constant.",
        "Time: O(total word length + n * maxWordLength) in the worst case, bounded in practice by O(n^2) since a walk cannot exceed n steps. Space: O(total word length * 26).",
      ],
    },
    {
      name: "Word Search II",
      difficulty: "Hard",
      variation: "Trie-guided DFS on a grid",
      link: "https://leetcode.com/problems/word-search-ii/",
      question: [
        "Given an m x n board of characters and a list of words, return all words from the list that can be constructed on the board. A word is constructed from sequentially adjacent cells, where adjacent means horizontally or vertically neighbouring, and the same cell may not be used more than once within a single word.",
        "Example 1:\nInput: board = [['o','a','a','n'],['e','t','a','e'],['i','h','k','r'],['i','f','l','v']], words = ['oath','pea','eat','rain']\nOutput: ['oath','eat']\nExplanation: 'oath' runs from (0,0) down and across through o, a, t, h; 'eat' runs through e, a, t. 'pea' and 'rain' cannot be traced with orthogonal steps only.",
        "Example 2:\nInput: board = [['a','b'],['c','d']], words = ['abcb']\nOutput: []\nExplanation: Spelling abcb would require visiting the cell holding b twice.",
        "Constraints:\n- 1 <= m, n <= 12\n- 1 <= words.length <= 3 * 10^4\n- 1 <= words[i].length <= 10\n- board and words consist of lowercase English letters",
      ],
      code: `vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {
    int m = board.size(), n = board[0].size();
    vector<array<int,26>> nxt(1);
    nxt[0].fill(-1);
    vector<int> wid(1, -1);                 // index of the word ending at this node, else -1
    for (int i = 0; i < (int)words.size(); i++) {
        int cur = 0;
        for (char ch : words[i]) {
            int c = ch - 'a';
            if (nxt[cur][c] == -1) {
                nxt[cur][c] = (int)nxt.size();
                nxt.push_back(array<int,26>());
                nxt.back().fill(-1);
                wid.push_back(-1);
            }
            cur = nxt[cur][c];
        }
        wid[cur] = i;
    }
    vector<string> res;
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    function<void(int,int,int)> dfs = [&](int r, int c, int node) {
        char ch = board[r][c];
        if (ch == '#') return;              // cell already on the current path
        int nx = nxt[node][ch - 'a'];
        if (nx == -1) return;               // no word continues with this letter, prune
        if (wid[nx] != -1) {
            res.push_back(words[wid[nx]]);
            wid[nx] = -1;                   // report each word at most once
        }
        board[r][c] = '#';
        for (int k = 0; k < 4; k++) {
            int a = r + dr[k], b = c + dc[k];
            if (a < 0 || a >= m || b < 0 || b >= n) continue;
            dfs(a, b, nx);
        }
        board[r][c] = ch;
    };
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) dfs(r, c, 0);
    }
    return res;
}`,
      explanation: [
        "The state is (cell, trie node): the path walked so far on the board spells exactly the string of that trie node. Every DFS step must advance both simultaneously, which is what ties the board walk to the dictionary.",
        "The whole speedup is the single line that returns when the child is absent. Running Word Search once per word would restart the grid search 3 * 10^4 times; here all words share one traversal, and a partial path is abandoned as soon as it stops being a prefix of any word - so the DFS explores the union of the words' prefixes rather than the union of the words.",
        "Marking the visited cell with '#' and restoring it afterwards is the standard in-place path set; it must be restored on every exit path, otherwise later starts see a corrupted board. Clearing wid[nx] after reporting handles the fact that one word may be traceable from several starting cells.",
        "A tempting but wrong prune is to stop as soon as a word is found. Longer words may continue through the same node ('oat' and 'oath'), so the search has to keep descending after a hit.",
        "Time: O(total word characters + m * n * 4 * 3^(L-1)) in the worst case, with L the maximum word length. Space: O(total word characters * 26 + L) for recursion.",
      ],
    },
    {
      name: "Concatenated Words",
      difficulty: "Hard",
      variation: "Trie plus word-break DP over the dictionary",
      link: "https://leetcode.com/problems/concatenated-words/",
      question: [
        "Given an array of strings words with no duplicates, return all the concatenated words in it. A concatenated word is a string that is made up of at least two shorter words from the same array; the shorter words may be reused.",
        "Example 1:\nInput: words = ['cat','cats','catsdogcats','dog','dogcatsdog','hippopotamuses','rat','ratcatdogcat']\nOutput: ['catsdogcats','dogcatsdog','ratcatdogcat']\nExplanation: catsdogcats = cats + dog + cats, dogcatsdog = dog + cats + dog, ratcatdogcat = rat + cat + dog + cat.",
        "Example 2:\nInput: words = ['cat','dog','catdog']\nOutput: ['catdog']\nExplanation: catdog = cat + dog. The words cat and dog are not themselves concatenations.",
        "Constraints:\n- 1 <= words.length <= 10^4\n- 1 <= words[i].length <= 30\n- words consists of distinct lowercase English strings\n- The sum of all word lengths is at most 10^5",
      ],
      code: `vector<string> findAllConcatenatedWordsInADict(vector<string>& words) {
    vector<array<int,26>> nxt(1);
    nxt[0].fill(-1);
    vector<char> isEnd(1, 0);
    auto add = [&](const string& w) {
        int cur = 0;
        for (char ch : w) {
            int c = ch - 'a';
            if (nxt[cur][c] == -1) {
                nxt[cur][c] = (int)nxt.size();
                nxt.push_back(array<int,26>());
                nxt.back().fill(-1);
                isEnd.push_back(0);
            }
            cur = nxt[cur][c];
        }
        isEnd[cur] = 1;
    };
    sort(words.begin(), words.end(),
         [](const string& a, const string& b) { return a.size() < b.size(); });
    vector<string> res;
    for (auto& w : words) {
        int L = w.size();
        if (L == 0) continue;
        vector<char> dp(L + 1, 0);
        dp[0] = 1;
        for (int i = 0; i < L; i++) {
            if (!dp[i]) continue;
            int cur = 0;
            for (int j = i; j < L; j++) {
                int c = w[j] - 'a';
                if (nxt[cur][c] == -1) break;
                cur = nxt[cur][c];
                if (isEnd[cur]) dp[j + 1] = 1;
            }
        }
        if (dp[L]) res.push_back(w);   // spelled entirely by strictly shorter stored words
        add(w);                        // only now does w become usable as a piece
    }
    return res;
}`,
      explanation: [
        "dp[i] means 'the first i characters of the current word can be split into stored words'. Walking the suffix from each reachable i down the trie enumerates every stored word starting at i in one pass, exactly as in the word-break DP.",
        "The ordering is what makes the whole thing correct with a single dp array. Processing words by increasing length and inserting each word only after testing it guarantees the trie never contains the word being tested, so dp[L] can only be achieved by other words. Since all pieces are then strictly shorter than L, any successful split automatically uses at least two of them - the 'at least two words' condition needs no extra counter.",
        "Equal-length words already in the trie are harmless: a piece shorter than the whole word is required for any split into two or more parts, so a same-length word can never serve as a proper piece.",
        "The natural wrong version inserts every word up front and then asks whether each word is breakable. Every word then trivially breaks into itself, so you must additionally forbid using the whole string as a single piece - easy to get wrong, and it is exactly the check the length ordering removes.",
        "Time: O(sum of |w| * maxLen) in the worst case, roughly O(N * L^2) with L <= 30. Space: O(total characters * 26).",
      ],
    },
    {
      name: "Maximum XOR With an Element From Array",
      difficulty: "Hard",
      variation: "Binary trie with offline queries and an upper bound",
      link: "https://leetcode.com/problems/maximum-xor-with-an-element-from-array/",
      question: [
        "You are given an array nums and a list of queries where queries[i] = [xi, mi]. The answer to query i is the maximum value of xi XOR nums[j] over all j with nums[j] <= mi, or -1 if no element of nums is at most mi. Return an array of the answers to all queries in the original order.",
        "Example 1:\nInput: nums = [0,1,2,3,4], queries = [[3,1],[1,3],[5,6]]\nOutput: [3,3,7]\nExplanation: For [3,1] only 0 and 1 qualify, and 3 XOR 0 = 3. For [1,3] the candidates are 0,1,2,3 and 1 XOR 2 = 3. For [5,6] all elements qualify and 5 XOR 2 = 7.",
        "Example 2:\nInput: nums = [5,2,4,6,6,3], queries = [[12,4],[8,1],[6,3]]\nOutput: [15,-1,5]\nExplanation: For [12,4] the candidates are 2,4,3 and 12 XOR 3 = 15. For [8,1] nothing is at most 1, so -1. For [6,3] the candidates are 2 and 3, and 6 XOR 3 = 5.",
        "Constraints:\n- 1 <= nums.length, queries.length <= 10^5\n- 0 <= nums[j], xi, mi <= 10^9",
      ],
      code: `vector<int> maximizeXor(vector<int>& nums, vector<vector<int>>& queries) {
    sort(nums.begin(), nums.end());
    int q = queries.size();
    vector<int> idx(q);
    for (int i = 0; i < q; i++) idx[i] = i;
    sort(idx.begin(), idx.end(),
         [&](int a, int b) { return queries[a][1] < queries[b][1]; });
    const int B = 30;                       // 10^9 < 2^30
    vector<array<int,2>> t(1, {-1, -1});
    auto insert = [&](int x) {
        int cur = 0;
        for (int b = B - 1; b >= 0; b--) {
            int d = (x >> b) & 1;
            if (t[cur][d] == -1) { t[cur][d] = (int)t.size(); t.push_back({-1, -1}); }
            cur = t[cur][d];
        }
    };
    auto best = [&](int x) {
        int cur = 0, res = 0;
        for (int b = B - 1; b >= 0; b--) {
            int d = (x >> b) & 1;
            if (t[cur][1 - d] != -1) { res |= 1 << b; cur = t[cur][1 - d]; }
            else cur = t[cur][d];
        }
        return res;
    };
    vector<int> ans(q);
    int p = 0;
    for (int i : idx) {
        int x = queries[i][0], m = queries[i][1];
        while (p < (int)nums.size() && nums[p] <= m) insert(nums[p++]);
        ans[i] = (p == 0) ? -1 : best(x);   // trie still empty means no candidate <= m
    }
    return ans;
}`,
      explanation: [
        "Each query restricts the candidate set to a prefix of the sorted array, and those prefixes are nested. So sorting the queries by their bound m turns the restriction into a monotone process: the candidate set only grows, and each element is inserted into the trie exactly once across all queries.",
        "Given the right candidate set, the query is the plain max-XOR walk: descend from the top bit and take the opposite branch whenever it exists, which is optimal because a 1 at bit b is worth more than everything below it.",
        "This offline reordering is the key idea, and the reason indices must be carried along - the answers have to be written back in the original query order. Answering the queries in the given order instead would force either a rebuild of the trie per query, or a trie with subtree counts and deletions.",
        "The alternative online solution stores a minimum value in each trie node and refuses to descend into a subtree whose minimum exceeds m. That handles queries in arbitrary order at the cost of extra bookkeeping; the offline sort is simpler when all queries are known up front.",
        "Time: O(n log n + Q log Q + (n + Q) * B). Space: O(n * B + Q).",
      ],
    },
    {
      name: "Count Pairs With XOR in a Range",
      difficulty: "Hard",
      variation: "Binary trie with subtree counts, range counting",
      link: "https://leetcode.com/problems/count-pairs-with-xor-in-a-range/",
      question: [
        "Given an integer array nums and two integers low and high, return the number of nice pairs. A pair (i, j) is nice if i < j and low <= (nums[i] XOR nums[j]) <= high.",
        "Example 1:\nInput: nums = [1,4,2,7], low = 2, high = 6\nOutput: 6\nExplanation: The six pairs give 1^4=5, 1^2=3, 1^7=6, 4^2=6, 4^7=3, 2^7=5, and every one of them lies in [2,6].",
        "Example 2:\nInput: nums = [9,8,4,2,1], low = 5, high = 14\nOutput: 8\nExplanation: Of the ten pairs, only 9^8=1 and 2^1=3 fall outside [5,14]; the remaining eight (13, 11, 8, 12, 10, 9, 6, 5) are inside.",
        "Constraints:\n- 1 <= nums.length <= 2 * 10^4\n- 1 <= nums[i] <= 2 * 10^4\n- 1 <= low <= high <= 2 * 10^4",
      ],
      code: `int countPairs(vector<int>& nums, int low, int high) {
    const int B = 15;                       // 2 * 10^4 and high + 1 both fit below 2^15
    vector<array<int,2>> ch(1, {-1, -1});
    vector<int> cnt(1, 0);                  // how many inserted numbers pass through a node
    auto insert = [&](int x) {
        int cur = 0;
        for (int b = B - 1; b >= 0; b--) {
            int d = (x >> b) & 1;
            if (ch[cur][d] == -1) {
                ch[cur][d] = (int)ch.size();
                ch.push_back({-1, -1});
                cnt.push_back(0);
            }
            cur = ch[cur][d];
            cnt[cur]++;
        }
    };
    // how many already inserted y satisfy (x ^ y) < limit
    auto countLess = [&](int x, int limit) {
        int cur = 0, res = 0;
        for (int b = B - 1; b >= 0 && cur != -1; b--) {
            int xb = (x >> b) & 1, lb = (limit >> b) & 1;
            if (lb == 1) {
                int lo = ch[cur][xb];       // xor bit 0 < 1 here: this whole subtree is below limit
                if (lo != -1) res += cnt[lo];
                cur = ch[cur][1 - xb];      // xor bit 1: still tied with limit, keep descending
            } else {
                cur = ch[cur][xb];          // xor bit must be 0 to stay under limit
            }
        }
        return res;
    };
    int ans = 0;
    for (int x : nums) {
        ans += countLess(x, high + 1) - countLess(x, low);
        insert(x);
    }
    return ans;
}`,
      explanation: [
        "Two reductions make this tractable. First, a closed range is a difference of two open counts: pairs with xor in [low, high] equal pairs with xor < high + 1 minus pairs with xor < low. Second, processing elements left to right and querying before inserting means each unordered pair is counted exactly once, at its later index.",
        "The counting walk compares the xor against limit bit by bit, maintaining the invariant that the current node holds all y whose xor with x agrees with limit on every bit seen so far. When limit has a 1 at bit b, choosing the child that makes the xor bit 0 drops strictly below limit regardless of the lower bits, so that entire subtree can be added in bulk using its stored count; the other child stays tied and the walk continues. When limit has a 0, only the xor-bit-0 child can stay under limit, and nothing is banked.",
        "The subtree counts are what make the bulk step O(1) instead of a subtree traversal, and they are why every node on an insertion path is incremented rather than only the leaf.",
        "The trap is trying to count the range directly in one walk with two simultaneous bounds. It is doable but the case analysis is fiddly; the subtract-two-prefix-counts formulation is the standard trick and it reuses one simple routine. The other trap is a fixed bit width that is too small - limit is high + 1, which can need one more bit than any array value.",
        "Time: O(n * B). Space: O(n * B).",
      ],
    },
  ],
};
