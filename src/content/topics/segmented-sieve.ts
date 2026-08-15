import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const segmentedSieve: TopicContent = {
  quickSummary: [
    "Sieve small primes up to \u221aR, then strike their multiples inside the [L, R] window only.",
    "Finds primes in ranges like [1e12, 1e12+1e6] using O(R-L) memory.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Segmented Sieve",
      source: `// Prime number in a range l .... r

#include<bits/stdc++.h>
using namespace std;
vector<int>prime;
vector<int>prime_range;
void sieve(int n)
{
	std::vector<bool> isprime(n + 1, true);
	for (long long i = 2; i <= n; ++i)
	{
		if (isprime[i])
		{
			prime.push_back(i);
			for (int j = i * i; j <= n ; j = j + i)
			{
				isprime[j] = false;
			}
		}
	}
}

void segsieve(int l, int h)
{

	long long sq = sqrt(h);
	sieve(sq);

	std::vector<bool> isprime(h - l + 1, true);
	for (long long p : prime)
	{
		long long sm = (l / p) * p;
		if (sm < l)
			sm += p;
		if (sm == p)sm += p;
		for (long long j =  sm  ; j <= h; j = j + p)
		{
			isprime[j - l] = false;

		}

	}
	for (int i = l; i <= h; ++i)
	{
		if (i > 1 && isprime[i - l] == true)
			prime_range.push_back(i);
	}
}



signed main()
{
	int t; cin >> t;
	while (t--)
	{
		int l, r; cin >> l >> r;
		prime.clear();
		prime_range.clear();
		segsieve(l, r);
		for (int i = 0; i < prime_range.size(); ++i)
		{
			cout << prime_range[i] << " ";
		}
		cout <<  endl;
	}

}`,
    },
  ],
  cheatSheet: [
    "Use when R is huge but the window is small.",
    "Careful with the start offset: first multiple \u2265 L.",
  ],
};
