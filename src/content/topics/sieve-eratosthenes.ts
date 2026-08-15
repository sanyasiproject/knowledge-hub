import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const sieveEratosthenes: TopicContent = {
  quickSummary: [
    "Mark multiples of each prime starting at p\u00b2 \u2014 everything unmarked is prime, in O(n log log n).",
    "The baseline preprocessing for factor/divisor problems.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Sieve of Eratosthenes",
      source: `void sieve(int n)
{
  std::vector<bool> isprime(n + 1, true);
  for (ll i = 0; i <= n; ++i)
  {
    if (isprime[i])
    {
      prime.pb(i);
      for (int j = i * i; j <= n ; j = j + i)
      {
        isprime[j] = false;
      }
    }
  }
}`,
    },
  ],
  cheatSheet: [
    "Start inner loop at p\u00b7p.",
    "1e7 range is comfortably fast; use bitsets beyond.",
  ],
};
