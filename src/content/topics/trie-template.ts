import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const trieTemplate: TopicContent = {
  quickSummary: [
    "Insert/search words character by character; nodes store counts to support prefix counting and deletion.",
    "The binary variant over bits solves max-XOR-pair style problems.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Trie (CP Template)",
      source: `#include<bits/stdc++.h>
using namespace std;

struct Node {
	Node* links[26];
	int cntEndWith = 0;
	int cntPrefix = 0;

	bool containsKey(char ch) {
		return (links[ch - 'a'] != NULL);
	}

	Node* get(char ch) {
		return links[ch - 'a'];
	}

	void put(char ch, Node* node) {
		links[ch - 'a'] = node;
	}

	void increaseEnd() {
		cntEndWith++;
	}

	void increasePrefix() {
		cntPrefix++;
	}

	void deleteEnd() {
		cntEndWith--;
	}

	void reducePrefix() {
		cntPrefix--;
	}
};

class Trie {
private:
	Node* root;

public:
	Trie() {
		root = new Node();
	}

	void insert(string &word) {
		Node* node = root;
		for (int i = 0; i < word.size(); i++) {
			if (!node->containsKey(word[i])) {
				node->put(word[i], new Node());
			}
			node = node->get(word[i]);
			node->increasePrefix();
		}
		node->increaseEnd();
	}

	int countWordsEqualTo(string &word) {
		Node* node = root;
		for (int i = 0; i < word.size(); i++) {
			if (node->containsKey(word[i])) {
				node = node->get(word[i]);
			} else {
				return 0;
			}
		}
		return node->cntEndWith;
	}

	int countWordsStartingWith(string &word) {
		Node* node = root;
		for (int i = 0; i < word.size(); i++) {
			if (node->containsKey(word[i])) {
				node = node->get(word[i]);
			} else {
				return 0;
			}
		}
		return node->cntPrefix;
	}

	void erase(string &word) {
		Node* node = root;
		for (int i = 0; i < word.size(); i++) {
			if (node->containsKey(word[i])) {
				node = node->get(word[i]);
				node->reducePrefix();
			} else {
				return;
			}
		}
		node->deleteEnd();
	}
};


signed main()
{
	Trie trie;
	int n; cin >> n;
	for (int i = 0; i < n; ++i)
	{
		string s; cin >> s;
		trie.insert(s);
	}


}`,
    },
  ],
  cheatSheet: [
    "Prefix counting: increment a counter at every node on insert.",
    "Binary trie: walk opposite bits greedily for max XOR.",
  ],
};
