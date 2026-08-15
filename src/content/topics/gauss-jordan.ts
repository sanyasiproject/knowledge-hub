import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const gaussJordan: TopicContent = {
  quickSummary: [
    "Row-reduces a matrix with partial pivoting to solve systems, compute determinants, and invert matrices in O(n\u00b3).",
    "Pivot selection keeps floating-point behavior stable.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Gauss-Jordan Elimination",
      source: `// Gauss-Jordan elimination with full pivoting.
//
// Uses:
//   (1) solving systems of linear equations (AX=B)
//   (2) inverting matrices (AX=I)
//   (3) computing determinants of square matrices
//
// Running time: O(n^3)
//
// INPUT:    a[][] = an nxn matrix
//           b[][] = an nxm matrix
//
// OUTPUT:   X      = an nxm matrix (stored in b[][])
//           A^{-1} = an nxn matrix (stored in a[][])
//           returns determinant of a[][]

#include<bits/stdc++.h>
using namespace std;
const double EPS = 1e-10;

double GaussJordan(vector<vector<double>> &a, vector<vector<double>> &b) {
	const int n = a.size();
	const int m = b[0].size();
	vector<int> irow(n), icol(n), ipiv(n);
	double det = 1;

	for (int i = 0; i < n; i++) {
		int pj = -1, pk = -1;
		for (int j = 0; j < n; j++) if (!ipiv[j])
				for (int k = 0; k < n; k++) if (!ipiv[k])
						if (pj == -1 || fabs(a[j][k]) > fabs(a[pj][pk])) { pj = j; pk = k; }
		if (fabs(a[pj][pk]) < EPS) { cerr << "Matrix is singular." << endl; exit(0); }
		ipiv[pk]++;
		swap(a[pj], a[pk]);
		swap(b[pj], b[pk]);
		if (pj != pk) det *= -1;
		irow[i] = pj;
		icol[i] = pk;

		double c = 1.0 / a[pk][pk];
		det *= a[pk][pk];
		a[pk][pk] = 1.0;
		for (int p = 0; p < n; p++) a[pk][p] *= c;
		for (int p = 0; p < m; p++) b[pk][p] *= c;
		for (int p = 0; p < n; p++) if (p != pk) {
				c = a[p][pk];
				a[p][pk] = 0;
				for (int q = 0; q < n; q++) a[p][q] -= a[pk][q] * c;
				for (int q = 0; q < m; q++) b[p][q] -= b[pk][q] * c;
			}
	}

	for (int p = n - 1; p >= 0; p--) if (irow[p] != icol[p]) {
			for (int k = 0; k < n; k++) swap(a[k][irow[p]], a[k][icol[p]]);
		}

	return det;
}

int main() {

	int n, m; cin >> n >> m;
	vector<vector<double>>A(n, vector<double>(n));
	vector<vector<double>>B(n, vector<double>(m));
	for (int i = 0; i < n; ++i)
	{
		for (int j = 0; j < n; ++j)
		{
			cin >> A[i][j];
		}
	}

	for (int i = 0; i < n; ++i)
	{
		for (int j = 0; j < m; ++j)
		{
			cin >> B[i][j];
		}
	}

	vector<vector<double>> inv(n, vector<double>(n)), X(n, vector<double>(m));
	for (int i = 0; i < n; i++) {
		inv[i] = vector<double> (A[i].begin(), A[i].end());
		X[i] = vector<double> (B[i].begin(), B[i].end());
	}

	double det = GaussJordan(inv, X);
	cout << "Determinant: " << det << endl;

	cout << "Inverse: " << endl;
	for (int i = 0; i < n; i++) {
		for (int j = 0; j < n; j++)
			cout << inv[i][j] << ' ';
		cout << endl;
	}

	cout << "Solution: " << endl;
	for (int i = 0; i < n; i++) {
		for (int j = 0; j < m; j++)
			cout << X[i][j] << ' ';
		cout << endl;
	}
}

// INPUT : -
// {
//     3 1
//     1 2 3
//     1 1 2
//     3 1 2
//     1
//     4
//     5
// }

// OUTPUT : -
// {
// Determinant: 2
// Inverse:
//     0 - 0.5 0.5
//     2 - 3.5 0.5
//     - 1 2.5 - 0.5
// Solution:
//     0.5
//     - 9.5
//     6.5
// }`,
    },
  ],
  cheatSheet: [
    "One routine \u2192 solution vector, determinant, and inverse.",
    "Near-zero pivots mean singular/degenerate systems \u2014 handle explicitly.",
  ],
};
