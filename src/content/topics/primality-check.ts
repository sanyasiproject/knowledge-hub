import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const primalityCheck: TopicContent = {
  quickSummary: [
    "Tests divisibility only up to \u221an \u2014 every composite has a factor there.",
    "Right tool for a handful of medium-sized checks; use a sieve for many queries.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Primality Check",
      source: `bool isprime(int n)
{
	if (n == 0 || n == 1)return false;
	if (n == 2 || n == 3)return true;
	if (n % 2 == 0 || n % 3 == 0)return false;
	for (int i = 5; i * i <= n; i = i + 6)
	{
		if (n % i == 0 || n % (i + 2) == 0)
			return false;
	}
	return true;
}`,
    },
  ],
  cheatSheet: [
    "O(\u221an) per check.",
    "For n up to 1e18 switch to Miller\u2013Rabin.",
  ],
};
