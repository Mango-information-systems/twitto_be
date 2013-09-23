!function(r){function n(r){return r}function t(r,n){for(var t=0,e=n.length,u=Array(e);e>t;++t)u[t]=r[n[t]]
return u}function e(r){// Locate the insertion point for x in a to maintain sorted order. The
// arguments lo and hi may be used to specify a subset of the array which
// should be considered; by default the entire array is used. If x is already
// present in a, the insertion point will be before (to the left of) any
// existing entries. The return value is suitable for use as the first
// argument to `array.splice` assuming that a is already sorted.
//
// The returned insertion point i partitions the array a into two halves so
// that all v < x for v in a[lo:i] for the left side and all v >= x for v in
// a[i:hi] for the right side.
function n(n,t,e,u){for(;u>e;){var f=e+u>>>1
r(n[f])<t?e=f+1:u=f}return e}// Similar to bisectLeft, but returns an insertion point which comes after (to
// the right of) any existing entries of x in a.
//
// The returned insertion point i partitions the array into two halves so that
// all v <= x for v in a[lo:i] for the left side and all v > x for v in
// a[i:hi] for the right side.
function t(n,t,e,u){for(;u>e;){var f=e+u>>>1
t<r(n[f])?u=f:e=f+1}return e}return t.right=t,t.left=n,t}function u(r){// Builds a binary heap within the specified array a[lo:hi]. The heap has the
// property such that the parent a[lo+i] is always less than or equal to its
// two children: a[lo+2*i+1] and a[lo+2*i+2].
function n(r,n,t){for(var u=t-n,f=(u>>>1)+1;--f>0;)e(r,f,u,n)
return r}// Sorts the specified array a[lo:hi] in descending order, assuming it is
// already a heap.
function t(r,n,t){for(var u,f=t-n;--f>0;)u=r[n],r[n]=r[n+f],r[n+f]=u,e(r,1,f,n)
return r}// Sifts the element a[lo+i-1] down the heap, where the heap is the contiguous
// slice of array a[lo:lo+n]. This method can also be used to update the heap
// incrementally, without incurring the full cost of reconstructing the heap.
function e(n,t,e,u){for(var f,o=n[--u+t],i=r(o);(f=t<<1)<=e&&(e>f&&r(n[u+f])>r(n[u+f+1])&&f++,!(i<=r(n[u+f])));)n[u+t]=n[u+f],t=f
n[u+t]=o}return n.sort=t,n}function f(r){// Returns a new array containing the top k elements in the array a[lo:hi].
// The returned array is not sorted, but maintains the heap property. If k is
// greater than hi - lo, then fewer than k elements will be returned. The
// order of elements in a is unchanged by this operation.
function n(n,e,u,f){var o,i,a,c,l=Array(f=Math.min(u-e,f))
for(i=0;f>i;++i)l[i]=n[e++]
if(t(l,0,f),u>e){o=r(l[0])
do(a=r(c=n[e])>o)&&(l[0]=c,o=r(t(l,0,f)[0]))
while(++e<u)}return l}var t=u(r)
return n}function o(r){function n(n,t,e){for(var u=t+1;e>u;++u){for(var f=u,o=n[u],i=r(o);f>t&&r(n[f-1])>i;--f)n[f]=n[f-1]
n[f]=o}return n}return n}function i(r){function n(r,n,u){return(U>u-n?e:t)(r,n,u)}function t(t,e,u){// Compute the two pivots by looking at 5 elements.
var f,o=0|(u-e)/6,i=e+o,a=u-1-o,c=e+u-1>>1,// The midpoint.
l=c-o,v=c+o,s=t[i],h=r(s),d=t[l],p=r(d),g=t[c],y=r(g),m=t[v],b=r(m),A=t[a],k=r(A);// Sort the selected 5 elements using a sorting network.
h>p&&(f=s,s=d,d=f,f=h,h=p,p=f),b>k&&(f=m,m=A,A=f,f=b,b=k,k=f),h>y&&(f=s,s=g,g=f,f=h,h=y,y=f),p>y&&(f=d,d=g,g=f,f=p,p=y,y=f),h>b&&(f=s,s=m,m=f,f=h,h=b,b=f),y>b&&(f=g,g=m,m=f,f=y,y=b,b=f),p>k&&(f=d,d=A,A=f,f=p,p=k,k=f),p>y&&(f=d,d=g,g=f,f=p,p=y,y=f),b>k&&(f=m,m=A,A=f,f=b,b=k,k=f)
var x=d,w=p,E=m,O=b;// e2 and e4 have been saved in the pivot variables. They will be written
// back, once the partitioning is finished.
t[i]=s,t[l]=t[e],t[c]=g,t[v]=t[u-1],t[a]=A
var M=e+1,// First element in the middle partition.
U=u-2,z=O>=w&&w>=O
if(z)// Degenerated case where the partitioning becomes a dutch national flag
// problem.
//
// [ |  < pivot  | == pivot | unpartitioned | > pivot  | ]
//  ^             ^          ^             ^            ^
// left         less         k           great         right
//
// a[left] and a[right] are undefined and are filled after the
// partitioning.
//
// Invariants:
//   1) for x in ]left, less[ : x < pivot.
//   2) for x in [less, k[ : x == pivot.
//   3) for x in ]great, right[ : x > pivot.
for(var N=M;U>=N;++N){var C=t[N],S=r(C)
if(w>S)N!==M&&(t[N]=t[M],t[M]=C),++M
else if(S>w)// Find the first element <= pivot in the range [k - 1, great] and
// put [:ek:] there. We know that such an element must exist:
// When k == less, then el3 (which is equal to pivot) lies in the
// interval. Otherwise a[k - 1] == pivot and the search stops at k-1.
// Note that in the latter case invariant 2 will be violated for a
// short amount of time. The invariant will be restored when the
// pivots are put into their final positions.
for(;;){var q=r(t[U])
{if(!(q>w)){if(w>q){// Triple exchange.
t[N]=t[M],t[M++]=t[U],t[U--]=C
break}t[N]=t[U],t[U--]=C;// Note: if great < k then we will exit the outer loop and fix
// invariant 2 (which we just violated).
break}U--}}}else// We partition the list into three parts:
//  1. < pivot1
//  2. >= pivot1 && <= pivot2
//  3. > pivot2
//
// During the loop we have:
// [ | < pivot1 | >= pivot1 && <= pivot2 | unpartitioned  | > pivot2  | ]
//  ^            ^                        ^              ^             ^
// left         less                     k              great        right
//
// a[left] and a[right] are undefined and are filled after the
// partitioning.
//
// Invariants:
//   1. for x in ]left, less[ : x < pivot1
//   2. for x in [less, k[ : pivot1 <= x && x <= pivot2
//   3. for x in ]great, right[ : x > pivot2
for(var N=M;U>=N;N++){var C=t[N],S=r(C)
if(w>S)N!==M&&(t[N]=t[M],t[M]=C),++M
else if(S>O)for(;;){var q=r(t[U])
{if(!(q>O)){// a[great] <= pivot2.
w>q?(// Triple exchange.
t[N]=t[M],t[M++]=t[U],t[U--]=C):(// a[great] >= pivot1.
t[N]=t[U],t[U--]=C)
break}if(U--,N>U)break}}}if(// Move pivots into their final positions.
// We shrunk the list from both sides (a[left] and a[right] have
// meaningless values in them) and now we move elements from the first
// and third partition into these locations so that we can store the
// pivots.
t[e]=t[M-1],t[M-1]=x,t[u-1]=t[U+1],t[U+1]=E,// The list is now partitioned into three partitions:
// [ < pivot1   | >= pivot1 && <= pivot2   |  > pivot2   ]
//  ^            ^                        ^             ^
// left         less                     great        right
// Recursive descent. (Don't include the pivot values.)
n(t,e,M-1),n(t,U+2,u),z)// All elements in the second partition are equal to the pivot. No
// need to sort them.
return t;// In theory it should be enough to call _doSort recursively on the second
// partition.
// The Android source however removes the pivot elements from the recursive
// call if the second partition is too large (more than 2/3 of the list).
if(i>M&&U>a){for(var F,q;(F=r(t[M]))<=w&&F>=w;)++M
for(;(q=r(t[U]))<=O&&q>=O;)--U;// Copy paste of the previous 3-way partitioning with adaptions.
//
// We partition the list into three parts:
//  1. == pivot1
//  2. > pivot1 && < pivot2
//  3. == pivot2
//
// During the loop we have:
// [ == pivot1 | > pivot1 && < pivot2 | unpartitioned  | == pivot2 ]
//              ^                      ^              ^
//            less                     k              great
//
// Invariants:
//   1. for x in [ *, less[ : x == pivot1
//   2. for x in [less, k[ : pivot1 < x && x < pivot2
//   3. for x in ]great, * ] : x == pivot2
for(var N=M;U>=N;N++){var C=t[N],S=r(C)
if(w>=S&&S>=w)N!==M&&(t[N]=t[M],t[M]=C),M++
else if(O>=S&&S>=O)for(;;){var q=r(t[U])
{if(!(O>=q&&q>=O)){// a[great] < pivot2.
w>q?(// Triple exchange.
t[N]=t[M],t[M++]=t[U],t[U--]=C):(// a[great] == pivot1.
t[N]=t[U],t[U--]=C)
break}if(U--,N>U)break}}}}// The second partition has now been cleared of pivot elements and looks
// as follows:
// [  *  |  > pivot1 && < pivot2  | * ]
//        ^                      ^
//       less                  great
// Sort the second partition using recursive descent.
// The second partition looks as follows:
// [  *  |  >= pivot1 && <= pivot2  | * ]
//        ^                        ^
//       less                    great
// Simply sort it by recursive descent.
return n(t,M,U+1)}var e=o(r)
return n}function a(r){return Array(r)}function c(r,n){return function(t){var e=t.length
return[r.left(t,n,0,e),r.right(t,n,0,e)]}}function l(r,n){var t=n[0],e=n[1]
return function(n){var u=n.length
return[r.left(n,t,0,u),r.left(n,e,0,u)]}}function v(r){return[0,r.length]}function s(){return null}function h(){return 0}function d(r){return r+1}function p(r){return r-1}function g(r){return function(n,t){return n+ +r(t)}}function y(r){return function(n,t){return n-r(t)}}function m(){// when data is added
// Adds the specified new records to this crossfilter.
function r(r){var n=E,t=r.length;// If there's actually new data to add…
// Merge the new data into the existing data.
// Lengthen the filter bitset to handle the new records.
// Notify listeners (dimensions and groups) that new data is available.
return t&&(w=w.concat(r),U=S(U,E+=t),C.forEach(function(e){e(r,n,t)})),m}// Adds a new dimension with the specified value accessor function.
function e(r){// Incorporates the specified new records into this dimension.
// This function is responsible for updating filters, values, and index.
function e(n,e,u){// Permute new values into natural order using a sorted index.
P=n.map(r),Q=Y(A(u),0,u),P=t(P,Q);// Bisect newValues to determine which new records are selected.
var f,o,i=Z(P),a=i[0],c=i[1]
if(T)for(f=0;u>f;++f)T(P[f],o=Q[f]+e)||(U[o]|=W)
else{for(f=0;a>f;++f)U[Q[f]+e]|=W
for(f=c;u>f;++f)U[Q[f]+e]|=W}// If this dimension previously had no data, then we don't need to do the
// more expensive merge operation; use the new values and index as-is.
if(!e)return K=P,L=Q,rn=a,nn=c,void 0
var l=K,v=L,s=0,h=0;// Merge the old and new sorted values, and old and new index.
for(// Otherwise, create new arrays into which to merge new and old.
K=Array(E),L=b(E,E),f=0;e>s&&u>h;++f)l[s]<P[h]?(K[f]=l[s],L[f]=v[s++]):(K[f]=P[h],L[f]=Q[h++]+e);// Add any remaining old values.
for(;e>s;++s,++f)K[f]=l[s],L[f]=v[s];// Add any remaining new values.
for(;u>h;++h,++f)K[f]=P[h],L[f]=Q[h]+e;// Bisect again to recompute lo0 and hi0.
i=Z(K),rn=i[0],nn=i[1]}// When all filters have updated, notify index listeners of the new values.
function o(r,n,t){$.forEach(function(r){r(P,Q,n,t)}),P=Q=null}// Updates the selected values based on the specified bounds [lo, hi].
// This implementation is used by all the public filter methods.
function a(r){var n=r[0],t=r[1]
if(T)return T=null,B(function(r,e){return e>=n&&t>e}),rn=n,nn=t,V
var e,u,f,o=[],i=[];// Fast incremental update based on previous lo index.
if(rn>n)for(e=n,u=Math.min(rn,t);u>e;++e)U[f=L[e]]^=W,o.push(f)
else if(n>rn)for(e=rn,u=Math.min(n,nn);u>e;++e)U[f=L[e]]^=W,i.push(f);// Fast incremental update based on previous hi index.
if(t>nn)for(e=Math.max(n,nn),u=t;u>e;++e)U[f=L[e]]^=W,o.push(f)
else if(nn>t)for(e=Math.max(rn,t),u=nn;u>e;++e)U[f=L[e]]^=W,i.push(f)
return rn=n,nn=t,N.forEach(function(r){r(W,o,i)}),V}// Filters this dimension using the specified range, value, or null.
// If the range is null, this is equivalent to filterAll.
// If the range is an array, this is equivalent to filterRange.
// Otherwise, this is equivalent to filterExact.
function m(r){return null==r?R():Array.isArray(r)?F(r):"function"==typeof r?j(r):z(r)}// Filters this dimension to select the exact value.
function z(r){return a((Z=c(x,r))(K))}// Filters this dimension to select the specified range [lo, hi].
// The lower bound is inclusive, and the upper bound is exclusive.
function F(r){return a((Z=l(x,r))(K))}// Clears any filters on this dimension.
function R(){return a((Z=v)(K))}// Filters this dimension using an arbitrary function.
function j(r){return Z=v,B(T=r),rn=0,nn=E,V}function B(r){var n,t,e,u=[],f=[]
for(n=0;E>n;++n)!(U[t=L[n]]&W)^(e=r(K[n],t))&&(e?(U[t]&=X,u.push(t)):(U[t]|=W,f.push(t)))
N.forEach(function(r){r(W,u,f)})}// Returns the top K selected records based on this dimension's order.
// Note: observes this dimension's filter, unlike group and groupAll.
function D(r){for(var n,t=[],e=nn;--e>=rn&&r>0;)U[n=L[e]]||(t.push(w[n]),--r)
return t}// Returns the bottom K selected records based on this dimension's order.
// Note: observes this dimension's filter, unlike group and groupAll.
function G(r){for(var n,t=[],e=rn;nn>e&&r>0;)U[n=L[e]]||(t.push(w[n]),--r),e++
return t}// Adds a new group to this dimension, using the specified key function.
function H(r){// Incorporates the specified new values into this group.
// This function is responsible for updating groups and groupIndex.
function t(n,t,u,f){// Count the number of added groups,
// and widen the group index as needed.
function c(){++P===J&&(m=q(m,I<<=1),R=q(R,I),J=k(I))}var// index of new record
l,// object id
v,// old group
h,// old key
d,// new key
p,// group to add
g,y=F,m=b(P,J),A=D,x=H,O=P,// old cardinality
M=0,// index of old group
z=0;// Find the first new key (x1), skipping NaN keys.
for(// key of group to add
// If a reset is needed, we don't need to update the reduce values.
V&&(A=x=s),// Reset the new groups (k is a lower bound).
// Also, make sure that groupIndex exists and is long enough.
F=Array(P),P=0,R=O>1?S(R,E):b(E,J),// Get the first old key (x0 of g0), if it exists.
O&&(h=(v=y[0]).key);f>z&&!((d=r(n[z]))>=d);)++z;// While new keys remain…
for(;f>z;){// Add any selected records belonging to the added group, while
// advancing the new key and populating the associated group index.
for(// Determine the lesser of the two current keys; new and old.
// If there are no old keys remaining, then always add the new key.
v&&d>=h?(p=v,g=h,// Record the new index of the old group.
m[M]=P,// Retrieve the next old key.
(v=y[++M])&&(h=v.key)):(p={key:d,value:x()},g=d),// Add the lesser group.
F[P]=p;!(d>g||(R[l=t[z]+u]=P,U[l]&X||(p.value=A(p.value,w[l])),++z>=f));)d=r(n[z])
c()}// Add any remaining old groups that were greater than all new keys.
// No incremental reduce is needed; these groups have no new records.
// Also record the new index of the old group.
for(;O>M;)F[m[M]=P]=y[M++],c();// If we added any new groups before any old groups,
// update the group index of all the old records.
if(P>M)for(M=0;u>M;++M)R[M]=m[R[M]];// Modify the update and reset behavior based on the cardinality.
// If the cardinality is less than or equal to one, then the groupIndex
// is not needed. If the cardinality is zero, then there are no records
// and therefore no groups to update or reset. Note that we also must
// change the registered listener to point to the new method.
l=N.indexOf(Q),P>1?(Q=e,T=i):(1===P?(Q=o,T=a):(Q=s,T=s),R=null),N[l]=Q}// Reduces the specified selected or deselected records.
// This function is only used when the cardinality is greater than 1.
function e(r,n,t){if(r!==W&&!V){var e,u,f,o;// Add the added values.
for(e=0,f=n.length;f>e;++e)U[u=n[e]]&X||(o=F[R[u]],o.value=D(o.value,w[u]));// Remove the removed values.
for(e=0,f=t.length;f>e;++e)(U[u=t[e]]&X)===r&&(o=F[R[u]],o.value=G(o.value,w[u]))}}// Reduces the specified selected or deselected records.
// This function is only used when the cardinality is 1.
function o(r,n,t){if(r!==W&&!V){var e,u,f,o=F[0];// Add the added values.
for(e=0,f=n.length;f>e;++e)U[u=n[e]]&X||(o.value=D(o.value,w[u]));// Remove the removed values.
for(e=0,f=t.length;f>e;++e)(U[u=t[e]]&X)===r&&(o.value=G(o.value,w[u]))}}// Recomputes the group reduce values from scratch.
// This function is only used when the cardinality is greater than 1.
function i(){var r,n;// Reset all group values.
for(r=0;P>r;++r)F[r].value=H();// Add any selected records.
for(r=0;E>r;++r)U[r]&X||(n=F[R[r]],n.value=D(n.value,w[r]))}// Recomputes the group reduce values from scratch.
// This function is only used when the cardinality is 1.
function a(){var r,n=F[0];// Add any selected records.
for(// Reset the singleton group values.
n.value=H(),r=0;E>r;++r)U[r]&X||(n.value=D(n.value,w[r]))}// Returns the array of group values, in the dimension's natural order.
function c(){return V&&(T(),V=!1),F}// Returns a new array containing the top K group values, in reduce order.
function l(r){var n=j(c(),0,F.length,r)
return B.sort(n,0,n.length)}// Sets the reduce behavior for this group to use the specified functions.
// This method lazily recomputes the reduce values, waiting until needed.
function v(r,n,t){return D=r,G=n,H=t,V=!0,C}// A convenience method for reducing by count.
function m(){return v(d,p,h)}// A convenience method for reducing by sum(value).
function A(r){return v(g(r),y(r),h)}// Sets the reduce order, using the specified accessor.
function x(r){function n(n){return r(n.value)}return j=f(n),B=u(n),C}// A convenience method for natural ordering by reduce value.
function O(){return x(n)}// Returns the cardinality of this group, irrespective of any filters.
function M(){return P}// Removes this group and associated event listeners.
function z(){var r=N.indexOf(Q)
return r>=0&&N.splice(r,1),r=$.indexOf(t),r>=0&&$.splice(r,1),C}var C={top:l,all:c,reduce:v,reduceCount:m,reduceSum:A,order:x,orderNatural:O,size:M,remove:z};// Ensure that this group will be removed when the dimension is removed.
_.push(C)
var F,// array of {key, value}
R,// cardinality
j,B,D,G,H,// object id ↦ group id
I=8,J=k(I),P=0,Q=s,T=s,V=!0
return arguments.length<1&&(r=n),// The group listens to the crossfilter for when any dimension changes, so
// that it can update the associated reduce values. It must also listen to
// the parent dimension for when data is added, and compute new keys.
N.push(Q),$.push(t),// Incorporate any existing data into the grouping.
t(K,L,0,E),m().orderNatural()}// A convenience function for generating a singleton group.
function I(){var r=H(s),n=r.all
return delete r.all,delete r.top,delete r.order,delete r.orderNatural,delete r.size,r.value=function(){return n()[0].value},r}function J(){_.forEach(function(r){r.remove()})
var r=C.indexOf(e)
for(r>=0&&C.splice(r,1),r=C.indexOf(o),r>=0&&C.splice(r,1),r=0;E>r;++r)U[r]&=X
return O&=X,V}var// inverted one, e.g., 11110111
K,// sorted, cached array
L,// value rank ↦ object id
P,// temporary array storing newly-added values
Q,// for recomputing filter
T,V={filter:m,filterExact:z,filterRange:F,filterFunction:j,filterAll:R,top:D,bottom:G,group:H,groupAll:I,remove:J},W=~O&-~O,// lowest unset bit as mask, e.g., 00001000
X=~W,// temporary array storing newly-added index
Y=i(function(r){return P[r]}),Z=v,// the custom filter function in use
$=[],// when data is added
_=[],rn=0,nn=0;// Updating a dimension is a two-stage process. First, we must update the
// associated filters for the newly-added records. Once all dimensions have
// updated their filters, the groups are notified to update.
return C.unshift(e),C.push(o),// Incorporate any existing data into this dimension, and make sure that the
// filter bitset is wide enough to handle the new dimension.
O|=W,(M>=32?!W:O&(1<<M)-1)&&(U=q(U,M<<=1)),e(w,0,E),o(w,0,E),V}// A convenience method for groupAll on a dummy dimension.
// This implementation can be optimized since it always has cardinality 1.
function o(){// Incorporates the specified new values into this group.
function r(r,n){var t
if(!m)// Add the added values.
for(t=n;E>t;++t)U[t]||(a=c(a,w[t]))}// Reduces the specified selected or deselected records.
function n(r,n,t){var e,u,f
if(!m){// Add the added values.
for(e=0,f=n.length;f>e;++e)U[u=n[e]]||(a=c(a,w[u]));// Remove the removed values.
for(e=0,f=t.length;f>e;++e)U[u=t[e]]===r&&(a=l(a,w[u]))}}// Recomputes the group reduce value from scratch.
function t(){var r
for(a=v(),r=0;E>r;++r)U[r]||(a=c(a,w[r]))}// Sets the reduce behavior for this group to use the specified functions.
// This method lazily recomputes the reduce value, waiting until needed.
function e(r,n,t){return c=r,l=n,v=t,m=!0,s}// A convenience method for reducing by count.
function u(){return e(d,p,h)}// A convenience method for reducing by sum(value).
function f(r){return e(g(r),y(r),h)}// Returns the computed reduce value.
function o(){return m&&(t(),m=!1),a}// Removes this group and associated event listeners.
function i(){var t=N.indexOf(n)
return t>=0&&N.splice(t),t=C.indexOf(r),t>=0&&C.splice(t),s}var a,c,l,v,s={reduce:e,reduceCount:u,reduceSum:f,value:o,remove:i},m=!0;// The group listens to the crossfilter for when any dimension changes, so
// that it can update the reduce value. It must also listen to the parent
// dimension for when data is added.
return N.push(n),C.push(r),// For consistency; actually a no-op since resetNeeded is true.
r(w,0,E),u()}// Returns the number of records in this crossfilter, irrespective of any filters.
function a(){return E}var m={add:r,dimension:e,groupAll:o,size:a},w=[],// the records
E=0,// the number of records; data.length
O=0,// a bit mask representing which dimensions are in use
M=8,// number of dimensions that can fit in `filters`
U=z(0),// M bits per record; 1 is filtered out
N=[],// when the filters change
C=[]
return arguments.length?r(arguments[0]):m}// Returns an array of size n, big enough to store ids up to m.
function b(r,n){return(257>n?z:65537>n?N:C)(r)}// Constructs a new array of size n, with sequential values from 0 to n - 1.
function A(r){for(var n=b(r,r),t=-1;++t<r;)n[t]=t
return n}function k(r){return 8===r?256:16===r?65536:4294967296}m.version="1.2.0",m.permute=t
var x=m.bisect=e(n)
x.by=e
var w=m.heap=u(n)
w.by=u
var E=m.heapselect=f(n)
E.by=f
var O=m.insertionsort=o(n)
O.by=o;// Algorithm designed by Vladimir Yaroslavskiy.
// Implementation based on the Dart project; see lib/dart/LICENSE for details.
var M=m.quicksort=i(n)
M.by=i
var U=32,z=a,N=a,C=a,S=n,q=n
"undefined"!=typeof Uint8Array&&(z=function(r){return new Uint8Array(r)},N=function(r){return new Uint16Array(r)},C=function(r){return new Uint32Array(r)},S=function(r,n){var t=new r.constructor(n)
return t.set(r),t},q=function(r,n){var t
switch(n){case 16:t=N(r.length)
break
case 32:t=C(r.length)
break
default:throw Error("invalid array width!")}return t.set(r),t}),r.crossfilter=m}(this)
