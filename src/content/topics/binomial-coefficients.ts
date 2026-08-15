import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const binomialCoefficients: TopicContent = {
  quickSummary: [
    "Precompute factorials and inverse factorials once; every nCr afterwards is O(1) modular arithmetic.",
    "Inverse factorials come from one modular inverse plus a backwards sweep.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Binomial Coefficients (nCr mod p)",
      source: `#include<bits/stdc++.h>
using namespace std;
const int N = 1000001;

using namespace std;

// array to store inverse of 1 to N
int  factorialNumInverse[N + 1];

// array to precompute inverse of 1! to N!
int  naturalNumInverse[N + 1];

// array to store factorial of first N numbers
int  fact[N + 1];

// Function to precompute inverse of numbers
void InverseofNumber(int  p)
{
    naturalNumInverse[0] = naturalNumInverse[1] = 1;
    for (int i = 2; i <= N; i++)
        naturalNumInverse[i] = naturalNumInverse[p % i] * 1ll * (p - p / i) % p;
}
// Function to precompute inverse of factorials
void InverseofFactorial(int  p)
{
    factorialNumInverse[0] = factorialNumInverse[1] = 1;

    // precompute inverse of natural numbers
    for (int i = 2; i <= N; i++)
        factorialNumInverse[i] = (naturalNumInverse[i] * 1ll * factorialNumInverse[i - 1]) % p;
}

// Function to calculate factorial of 1 to N
void factorial(int  p)
{
    fact[0] = 1;

    // precompute factorials
    for (int i = 1; i <= N; i++) {
        fact[i] = (fact[i - 1] * 1ll * i) % p;
    }
}

// Function to return nCr % p in O(1) time
int  Binomial(int  N, int  R, int  p)
{
    // n C r = n!*inverse(r!)*inverse((n-r)!)
    int  ans = ((fact[N] * 1ll * factorialNumInverse[R])
                % p * 1ll * factorialNumInverse[N - R])
               % p;
    return ans;
}


int main()
{

    int  p = 1000000007;
    InverseofNumber(p);
    InverseofFactorial(p);
    factorial(p);

    // 1st query
    int  N = 15;
    int  R = 4;
    cout << Binomial(N, R, p) << endl;

    // 2nd query
    N = 20;
    R = 3;
    cout << Binomial(N, R, p) << endl;

    return 0;
}`,
    },
  ],
  cheatSheet: [
    "nCr = fact[n]\u00b7inv[r]\u00b7inv[n-r] mod p.",
    "Precompute up to max n once per program.",
  ],
};
