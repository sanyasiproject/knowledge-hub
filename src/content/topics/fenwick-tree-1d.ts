import type { TopicContent } from "../types";

/**
 * Template from the author's competitive-programming library
 * (github.com/SANYASI-RAJA/My_Cplusplus_Template). Code is intentionally
 * kept VERBATIM — do not "clean up" or reformat it.
 */
export const fenwickTree1d: TopicContent = {
  quickSummary: [
    "A Fenwick/Binary Indexed Tree stores partial prefix aggregates so both point update and prefix sum run in O(log n).",
    "The magic is `i & (-i)` \u2014 each index covers a block whose size is its lowest set bit.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Template \u2014 Fenwick Tree (1D)",
      source: `// 1 Based indexing

#include<bits/stdc++.h>
using namespace std; 

struct Fenwick{
   int n;
   vector<int>bit;

   Fenwick(int a){
     n=a;
     bit.resize(n+1);
   }

   void update(int ind,int val){
    for(;ind<=n;ind+=(ind&(-ind)))
        bit[ind]+=val;
   }

   int query(int ind){
    int res=0;
    for(;ind;ind-=(ind&(-ind)))
        res+=bit[ind];
    return res;
   }

};
 

int main(){   
    int n;cin>>n;
    vector<int>v(n);
    Fenwick fen(n);
    vector<int>psm(n);
    cout<<5<<endl;
    for (int i = 0; i < n; ++i){
        cin>>v[i];
        fen.update(i+1,v[i]);
    }
    int q;cin>>q;
    while(q--){
        int l,r;cin>>l>>r;
        cout<<fen.query(r)-fen.query(l-1)<<endl;
    }
}`,
    },
  ],
  cheatSheet: [
    "Point update + prefix/range sum: the default choice \u2014 smaller and faster than a segment tree.",
    "1-indexed. Range sum = query(r) - query(l-1).",
  ],
};
