import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const bitRanges: TopicContent = {
  quickSummary: [
    "Computes bitwise results over a whole range [L, R] without iterating element by element.",
    "Core trick: find the common high-bit prefix of L and R \u2014 bits below the first difference can be anything.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Bitwise Ops on Ranges",
      source: `#include<bits/stdc++.h>
using namespace std;

class BIT_range {
public:
	// for Natural number
	// All in O(log(max(l,r))) TC

	long long Range_Or(long long l, long long r)
	{
		long long orr = 0;
		for (int k = 0; k < 60; k++)
		{
			long long left = l >> k, right = r >> k;
			if (left == right && left % 2 == 0);
			else orr |= 1LL << k;
		}
		return orr;
	}

	long long Range_And(long long l, long long r)
	{
		long long range = 0;
		while (l != r && l > 0) {
			range++;
			l = l >> 1;
			r = r >> 1;
		}
		return (long long)(l << range);
	}

	long long xor_till(long long n)
	{
		long long md = n % 4;
		if (md == 0)return n;
		else if (md == 1)return 1;
		else if (md == 2)return n + 1;
		else return 0;
		return 0;
	}

	long long Range_Xor(long long l, long long r)
	{
		return xor_till(r)^xor_till(l - 1);
	}
};

int main()
{
	BIT_range bt;
	cout << bt.Range_And(3, 5) << endl;
	cout << bt.Range_Or(3, 5) << endl;
	cout << bt.Range_Xor(3, 5) << endl;
}`,
    },
  ],
  cheatSheet: [
    "Use when a problem asks for AND/OR/XOR over a numeric range.",
    "O(log R) per query \u2014 never loop the range.",
  ],
};
