import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const ahoCorasick: TopicContent = {
  quickSummary: [
    "Builds a trie of all patterns with failure links, then scans the text once \u2014 total O(text + patterns + matches).",
    "Failure links make it a KMP generalized to a dictionary.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Aho-Corasick Automaton",
      source: `//problem link :- (https://cses.fi/problemset/task/2102/)

#include<bits/stdc++.h>
using namespace std;
#define int long long

int dp[500005];
vector<int>adj[500005];
int val = 1;

struct node {
	int fail, ch[26] = {}, cnt = 0;
	vector<int>word;
} T[500005];

void insert(string &s, int ind)
{
	int x = 1;
	for (int i = 0; i < s.size(); ++i)
	{
		if (T[x].ch[s[i] - 'a'] == 0)
		{
			T[x].ch[s[i] - 'a'] = ++val;
		}
		x = T[x].ch[s[i] - 'a'];
	}
	T[x].word.push_back(ind);
}

void build() {
	queue<int>q;
	int x = 1;
	T[1].fail = 1;
	for (int i = 0; i < 26; ++i)
	{
		if (T[x].ch[i])
		{
			T[T[x].ch[i]].fail = x;
			q.push(T[x].ch[i]);
		}
		else
		{
			T[x].ch[i] = 1;
		}
	}

	while (!q.empty())
	{
		x = q.front();
		q.pop();

		for (int i = 0; i < 26; ++i)
		{
			if (T[x].ch[i])
			{
				T[T[x].ch[i]].fail = T[T[x].fail].ch[i];
				q.push(T[x].ch[i]);
			}
			else
			{
				T[x].ch[i] = T[T[x].fail].ch[i];
			}
		}
	}

	for (int i = 2; i <= val; ++i)
	{
		adj[T[i].fail].push_back(i);
	}

}


void run_AhoCorasick(string & s)
{

	for (int i = 0, x = 1; i < s.size(); ++i)
	{
		x = T[x].ch[s[i] - 'a'];
		T[x].cnt++;
	}

}

int dfs(int u)
{
	int res = T[u].cnt;
	for (int v : adj[u])
	{
		res += dfs(v);
	}
	for (int w : T[u].word)
		dp[w] = res;
	return res;
}



signed main()
{
	ios_base::sync_with_stdio(false);
	cin.tie(NULL);
	string s; cin >> s;
	int k; cin >> k;

	memset(dp, 0, sizeof(dp));
	for (int i = 0; i < k; ++i)
	{
		string temp; cin >> temp;
		if (temp.size() > s.size())
		{
			dp[i] = false;
			continue;
		}

		insert(temp, i);
	}
	build();
	run_AhoCorasick(s);
	dfs(1);
	for (int i = 0; i < k; ++i)
	{
		cout << (dp[i] ? "YES" : "NO") << endl;

	}
}`,
    },
  ],
  cheatSheet: [
    "Multiple-pattern search or 'count occurrences of each word' \u2192 Aho-Corasick.",
    "Also the backbone of many string DPs over forbidden words.",
  ],
};
