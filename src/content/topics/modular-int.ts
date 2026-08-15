import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const modularInt: TopicContent = {
  quickSummary: [
    "A Mint class wraps +, -, *, /, power under the mod so DP and combinatorics code reads like plain arithmetic.",
    "Division uses modular inverse internally \u2014 no scattered % noise or overflow bugs.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Modular Int (Mint)",
      source: `#include<bits/stdc++.h>
using namespace std;

mt19937_64 rng(chrono::steady_clock::now().time_since_epoch().count());
long long myRand(long long B) {
    return (long long)rng() % B;
}

const long long MOD = 1e9 + 7;
template<long long mod = MOD> struct mint { // 1000000007  1000000009
    long long x;

    mint() : x(0) {}
    mint(long long _x) {
        _x %= mod;
        if (_x < 0) _x += mod;
        x = _x;
    }

    mint& operator += (const mint &a) {
        x += a.x;
        if (x >= mod) x -= mod;
        return *this;
    }
    mint& operator -= (const mint &a) {
        x += mod - a.x;
        if (x >= mod) x -= mod;
        return *this;
    }
    mint& operator *= (const mint &a) {
        x = (long long)x * a.x % mod;
        return *this;
    }
    mint pow(long long pw) const {
        mint res = 1;
        mint cur = *this;
        while (pw) {
            if (pw & 1) res *= cur;
            cur *= cur;
            pw >>= 1;
        }
        return res;
    }
    mint inv() const {
        assert(x != 0);
        long long t = x;
        long long res = 1;
        while (t != 1) {
            long long z = mod / t;
            res = (long long)res * (mod - z) % mod;
            t = mod - t * z;
        }
        return res;
    }
    mint& operator /= (const mint &a) {
        return *this *= a.inv();
    }
    mint operator + (const mint &a) const {
        return mint(*this) += a;
    }
    mint operator - (const mint &a) const {
        return mint(*this) -= a;
    }
    mint operator * (const mint &a) const {
        return mint(*this) *= a;
    }
    mint operator / (const mint &a) const {
        return mint(*this) /= a;
    }

    bool sqrt(mint &res) const {
        if (mod == 2 || x == 0) {
            res = *this;
            return true;
        }
        if (pow((mod - 1) / 2) != 1) return false;
        if (mod % 4 == 3) {
            res = pow((mod + 1) / 4);
            return true;
        }
        int pw = (mod - 1) / 2;
        int K = 30;
        while ((1 << K) > pw) K--;
        while (true) {
            mint t = myRand(mod);
            mint a = 0, b = 0, c = 1;
            for (int k = K; k >= 0; k--) {
                a = b * b;
                b = b * c * 2;
                c = c * c + a * *this;
                if (((pw >> k) & 1) == 0) continue;
                a = b;
                b = b * t + c;
                c = c * t + a * *this;
            }
            if (b == 0) continue;
            c -= 1;
            c *= mint() - b.inv();
            if (c * c == *this) {
                res = c;
                return true;
            }
        }
        assert(false);
    }

    bool operator == (const mint &a) const {
        return x == a.x;
    }
    bool operator != (const mint &a) const {
        return x != a.x;
    }
    bool operator < (const mint &a) const {
        return x < a.x;
    }
};
using Mint = mint<>;

template<long long mod = MOD> struct Factorials {
    using Mint = mint<mod>;
    vector<Mint> f, fi;

    Factorials() : f(), fi() {}
    Factorials(int n) {
        n += 10;
        f = vector<Mint>(n);
        fi = vector<Mint>(n);
        f[0] = 1;
        for (int i = 1; i < n; i++)
            f[i] = f[i - 1] * i;
        fi[n - 1] = f[n - 1].inv();
        for (int i = n - 1; i > 0; i--)
            fi[i - 1] = fi[i] * i;
    }

    Mint C(int n, int k) {
        if (k < 0 || k > n) return 0;
        return f[n] * fi[k] * fi[n - k];
    }
};

int main() {
    Mint a = 5, b = 7;
    Mint res = a + b;
    cout << res.x;
}`,
    },
  ],
  cheatSheet: [
    "Drop-in replacement: write formulas naturally, mod handled automatically.",
    "Keep the mod prime for division to work.",
  ],
};
