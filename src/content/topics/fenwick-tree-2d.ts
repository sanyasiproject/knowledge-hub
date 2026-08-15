import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const fenwickTree2d: TopicContent = {
  quickSummary: [
    "Extends the Fenwick idea to 2D: both loops walk lowbit jumps, giving O(log n \u00b7 log m) point update and rectangle sum.",
    "Submatrix sum uses 2D inclusion\u2013exclusion over four prefix queries.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Fenwick Tree (2D)",
      source: `// 1 base indexing
// 2-D fenwick tree and 2-D prefix sum

#include<bits/stdc++.h>
using namespace std; 

struct Fenwick_2D{
    int n,m;
    vector<vector<int>>bit;

    Fenwick_2D(int a,int b){
    n=a;
    m=b;
    bit.resize(n+1,vector<int>(m+1));
    }

    void update(int ind_x,int ind_y,int val){
    for(int x=ind_x;x<=n;x+=(x&(-x)))
        for(int y=ind_y;y<=m;y+=(y&(-y)))
            bit[x][y]+=val;
    }

    int query(int ind_x,int ind_y){
        int res=0;
        for(int x=ind_x;x;x-=(x&(-x)))
            for(int y=ind_y;y;y-=(y&(-y)))
                res+=bit[x][y];
        return res;
    }

};


int main(){   
    int n,m;cin>>n>>m;
    vector<vector<int>>v(n,vector<int>(m));
    Fenwick_2D fen(n,m);
    vector<vector<int>>psm(n+1,vector<int>(m+1));
    for (int i = 0; i < n; ++i){
        for (int j = 0; j < m; ++j){
            cin>>v[i][j];
        }
    }
    for (int i = 1; i <= n; ++i){
        for (int j = 1; j <= m; ++j){
            psm[i][j]=v[i-1][j-1]+psm[i-1][j]+psm[i][j-1]-psm[i-1][j-1];
            fen.update(i,j,v[i-1][j-1]);
        }
    }
    int q;cin>>q;
    while(q--){
        int l1,r1,l2,r2;cin>>l1>>r1>>l2>>r2;
        cout<<psm[l2][r2]-psm[l1-1][r1-1]<<" ";
        cout<<fen.query(l2,r2)-fen.query(l1-1,r1-1)<<endl;
    }
}`,
    },
  ],
  cheatSheet: [
    "Use for dynamic 2D prefix sums when the grid fits in memory (n\u00b7m nodes).",
    "Rect sum: Q(x2,y2) - Q(x1-1,y2) - Q(x2,y1-1) + Q(x1-1,y1-1).",
  ],
};
