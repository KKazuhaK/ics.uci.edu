# Information and Computer Science 46 — Lecture 11: Heaps, Priority Queues

## Table of Contents

- [1. Recap: Insert and Sink](#1-recap-insert-and-sink)
- [2. Delete the Maximum](#2-delete-the-maximum)
- [3. Running Time of Heap Operations](#3-running-time-of-heap-operations)
- [4. The Priority Queue ADT](#4-the-priority-queue-adt)
- [5. Priority Queue Implementations](#5-priority-queue-implementations)
- [6. Min-Heaps and delMin](#6-min-heaps-and-delmin)
- [7. Heap Sort: The Plan](#7-heap-sort-the-plan)
- [8. Optimal (Bottom-Up) Heap Construction](#8-optimal-bottom-up-heap-construction)
- [9. Complete Implementation](#9-complete-implementation)
- [10. In-class Activities (with Solutions)](#10-in-class-activities-with-solutions)
- [11. Quick Reference & Top 5 Things to Remember](#11-quick-reference--top-5-things-to-remember)

> UCI ICS 46: Data Structure Implementation and Analysis — Prof. Tom Yeh, Fall 2026, 11/03/26
> Built from the Lecture 11 slides (which also carry the heap activities and delete-max slides from the end of the Lecture 10 deck; the heap runtime summary slide is imported from the Lecture 10 deck), with algs4 §2.4 Priority Queues as the supplement. Organized by concept, not by source.

> 📅 **Class logistics**: Quiz 4 this Friday 11/6 (Sorting, Trees, Heaps) · Midterm next Thursday 11/12 · No HW or Lab until after the midterm
> Midterm topics: templates, randomness, pointers, references, smart pointers, multidimensional data; analysis of algorithms, ArrayList, Linked List; Stacks, Queues, Deques; amortized analysis, analysis of recursion; comparison-based sorting
> Midterm prep: sample midterm, quizzes, lecture activities, homeworks, labs — lab implementations will be covered
> Finished grading: HW 2, 3, Lab 2, Quiz 2, Lecture Activities 5–10 · AI tool access needs the 2-part consent form (stored data will not be used for academic integrity issues; research consent = 1% extra credit, an alternate extra-credit method will be provided)

---

## 1. Recap: Insert and Sink

Both operations were introduced in [Lecture 10](lec-10.en-US.md#12-heap-insertion); this lecture opens by practicing them on the max-heap `– 100 19 36 17 3 25 1 2 7` (index 0 unused).

- **Insert**: put the key at `pq[++n]` (end of the bottom level), then **swim** it up while it is larger than its parent. Worst case: one compare per level, **O(log n)**.
- **Sink**: while a key is smaller than a child, exchange it with the **larger** child. Worst case: two compares per level, **O(log n)**.

Example: inserting 47 lands it at index 10 (child of 3). 47 > 3 → swap; 47 > 19 → swap; 47 < 100 → stop. Array: `– 100 47 36 17 19 25 1 2 7 3`.

> 📝 **Practice**: [Exercise: Heap Insertion](#101-exercise-heap-insertion-slide-5) and [Exercise: Heap Sink](#102-exercise-heap-sink-slide-6).

## 2. Delete the Maximum

**Delete max**: exchange the root with the node at the end, remove it from the heap (and return it), then **sink** the new root down. For a min-heap the same code returns (and deletes) the minimum.

```cpp
Key delMax() {
    Key max = pq[1];
    exch(1, n--);
    sink(1);
    return max;
}
```

`exch(1, n--)` swaps `pq[1]` with `pq[n]` and *then* shrinks n, so the old maximum sits just past the end of the heap and is no longer part of it.

**Cost: at most 2 log n compares.** The slide asks *why 2 log n vs log n?* Sink does **two compares per level** — one to pick the larger child (`less(j, j+1)`), one to compare the key with that child (`less(k, j)`) — and walks at most log n levels. Swim (insert) needs only one compare per level, since a node has one parent: at most log n + 1.

Slide 8's example: delete the max from `– T S R N P O A E I G H`. T and H are exchanged, T leaves the heap, then H sinks: H < S → swap; H < P → swap; H > G → stop. Result `– S P R N H O A E I G`.

```viz binary-heap
{"title": "Slide 8: delMax() on T S R N P O A E I G H", "heap": "T, S, R, N, P, O, A, E, I, G, H", "ops": "delMax()", "interactive": true}
```

> ⚠️ **Pitfall**: After `exch(1, n--)` the new root is the old *last* key, which is usually one of the smallest — so it almost always sinks most of the way down. Don't sink from index n or swim from the root; delMax only ever calls `sink(1)`.

> 📝 **Practice**: [Activity 1](#103-activity-1-delete-the-maximum-slide-9) — delete max once, its complexity, and nine deletes in a row.

## 3. Running Time of Heap Operations

From the runtime summary slide imported from the end of the Lecture 10 deck:

| Operation | Worst case | Why |
|---|---|---|
| Insertion | O(log n) | append + swim along one leaf-to-root path |
| Delete max | O(log n) | exch + sink along one root-to-leaf path (≤ 2 log n compares) |
| Find max | O(1) | it's `pq[1]` |
| Space | O(n) | one array slot per key (plus the unused `pq[0]`) |

The slides end the heap section with the algs4 *2.4 Binary Heap Demo* (an animation of insert and delete max on a letter heap).

> 📘 **Beyond the lecture**: With a fixed-size array the log n bounds are worst case. If the array grows by doubling on insert (and shrinks on delete), as with the ArrayList, the bounds become **amortized** O(log n) — an occasional insert also pays O(n) for the copy. (algs4 §2.4, practical considerations)

## 4. The Priority Queue ADT

A **priority queue** serves the **best element first**, in contrast to a FIFO queue (oldest first) or a LIFO stack (newest first). It has two key operations:

1. **Delete (return) the maximum** — retrieves the top-priority element;
2. **Insert** — adds a new element with its priority.

Practical applications from the slide: operating systems (load balancing, interrupt handling), compression (Huffman coding), AI (A\* search), graph search (Dijkstra's and Prim's algorithms). The key question: *how can we implement a priority queue efficiently?*

Example: insert 5, 1, 9, then delete max → 9; insert 7, delete max → 7. A FIFO queue would have returned 5 then 1.

## 5. Priority Queue Implementations

| Implementation | Insert | Delete maximum | Idea |
|---|---|---|---|
| Option 1: unordered array ("lazy") | O(1) | O(n) | append instantly; deletion scans the whole array for the max |
| Option 2: ordered array ("eager") | O(n) | O(1) | keep it sorted so the max is at the end; insertion shifts elements |
| Option 3: binary heap ("optimal balance") | O(log n) | O(log n) | tree structure gives logarithmic time for both |

Arrays force an extreme trade-off between O(1) and O(n); a binary heap brings both operations to logarithmic time, which is why it is the standard choice for the priority queue ADT. Over m operations of each kind, the arrays cost O(mn) in the worst case and the heap O(m log n).

> 📘 **Beyond the lecture**: The "best" choice depends on the mix. With a huge number of inserts and only a few delete-max calls, an unordered array wins (O(1) inserts). With many find-max calls and few updates, an ordered array wins (the max is always at the end). The heap is the choice when both operations are frequent. (algs4 §2.4 exercises)

## 6. Min-Heaps and delMin

A **min-heap** keeps each key **≤** its children, so the minimum is at the root. The code is the max-heap code with every comparison flipped (`less(a, b)` becomes "a is greater than b"), and delete max becomes **delMin**: swap the root with the last key, remove it, sink the new root toward the *smaller* child.

Slide 14's PQ uses a min-heap. Running its 12 operations (insert P, Q, E, delete min, insert X, A, M, delete min, insert P, L, E, delete min) returns **E, A, E** and leaves `– L P M Q P X`. Step through it below (← / → keys work when the demo is focused):

```viz binary-heap
{"title": "Slide 14: Activity 2 on a min-heap", "ops": "insert(P); insert(Q); insert(E); delMin(); insert(X); insert(A); insert(M); delMin(); insert(P); insert(L); insert(E); delMin()", "order": "min", "interactive": true}
```

> ⚠️ **Pitfall**: Duplicate keys are allowed. In step 9 the second P is inserted while a P is already in the heap; `less` is strict, so an equal key stops swimming as soon as it meets an equal parent and never swaps with it.

> 📝 **Practice**: [Activity 2](#104-activity-2-assume-min-heap-slide-14) — draw the heap after each step.

## 7. Heap Sort: The Plan

Use a heap to sort in two steps:

1. **Heap construction** — build a binary heap from all n keys to be sorted;
2. **Sortdown** — repeatedly remove and return the maximum key.

Example: the 9 keys of the Activity 1 heap come out of nine delete-max calls as `100 36 25 19 17 7 3 2 1` — sorted in decreasing order. Because `exch(1, n--)` parks each removed max just past the end of the shrinking heap, the array itself ends up sorted ascending: `– 1 2 3 7 17 19 25 36 100`. That in-place trick is the sortdown, covered in Lecture 12.

## 8. Optimal (Bottom-Up) Heap Construction

To turn an arbitrary array into a heap:

1. View the array as a complete binary tree (it already is one, in level order);
2. **Ignore all leaves** (indices n/2 + 1, …, n) — a single node is already a heap;
3. Sink every other node, from the last internal node back to the root:

```cpp
for ( int k = n/2; k >= 1; k-- )
    sink(a, k, n);
```

**Key insight:** after `sink(a, k, n)` completes, the subtree rooted at k is a heap. Sinking right to left means both children of k are already heaps when k is processed, so one sink fixes the whole subtree; after `sink(a, 1, n)` the whole array is a heap.

**Why does n/2 give the first node to process?** Node k has a left child exactly when 2k ≤ n, i.e. k ≤ n/2. The last node, n, has parent ⌊n/2⌋, so ⌊n/2⌋ is the last node with any child; every index above it is a leaf. With n = 11 the loop starts at k = 5.

`sink(a, k, n)` is the heap's `sink` taking the array and its size as arguments (so heap sort can work on any array); its body is the same as `sink(k)` from [Lecture 10](lec-10.en-US.md#13-sink-demote-top-down-heapify).

Slide 17–18's trace on `S O R T E X A M P L E` (n = 11):

| Step | Call | What moves | Array after |
|---|---|---|---|
| a) | start (arbitrary order) | — | S O R T E X A M P L E |
| b) | sink(5, 11) | E swaps with its larger child L | S O R T L X A M P E E |
| c) | sink(4, 11) | T ≥ M, P: no move | S O R T L X A M P E E |
| d) | sink(3, 11) | R swaps with X | S O X T L R A M P E E |
| e) | sink(2, 11) | O swaps with T, then with P | S T X P L R A M O E E |
| f) | sink(1, 11) | S swaps with X, stops above R and A | X T S P L R A M O E E |

```viz binary-heap
{"title": "Slides 17–18: bottom-up heap construction", "heap": "S, O, R, T, E, X, A, M, P, L, E", "ops": "sink(5); sink(4); sink(3); sink(2); sink(1)", "interactive": true}
```

> ➡️ **Continued in [Lecture 12](lec-12.en-US.md)**: the heap construction activity (naive vs optimized cost), the O(n) construction analysis, sortdown, heap sort analysis, the sorting summary and binary search trees — the Lecture 12 deck repeats them.

## 9. Complete Implementation

```cpp
#include <iostream>
#include <string>
#include <utility>
#include <vector>

// Max-oriented priority queue on a binary heap, pq[0] unused.
template <typename Key>
class MaxPQ {
private:
    std::vector<Key> pq{Key{}};   // pq[0] unused
    size_t n = 0;

    bool less(size_t i, size_t j) const { return pq[i] < pq[j]; }
    void exch(size_t i, size_t j) { std::swap(pq[i], pq[j]); }
    void swim(size_t k) {
        while (k > 1 && less(k/2, k)) {
            exch(k, k/2);
            k = k/2;
        }
    }
    void sink(size_t k) {
        while (2*k <= n) {
            size_t j = 2*k;
            if (j < n && less(j, j+1)) j++;
            if (!less(k, j)) break;
            exch(k, j);
            k = j;
        }
    }

public:
    bool isEmpty() const { return n == 0; }
    size_t size() const { return n; }
    void insert(const Key& x) {
        pq.push_back(x);              // slide: pq[++n] = x;
        ++n;
        swim(n);
    }
    Key delMax() {
        Key max = pq[1];
        exch(1, n--);
        sink(1);
        pq.pop_back();                // drop the old maximum from the vector
        return max;
    }
    void load(const std::vector<Key>& keys) {   // as-is, for the activities
        pq.assign(1, Key{});
        pq.insert(pq.end(), keys.begin(), keys.end());
        n = keys.size();
    }
    void sinkAt(size_t k) { sink(k); }
    void print() const {
        for (size_t i = 1; i <= n; i++) std::cout << pq[i] << ' ';
        std::cout << '\n';
    }
};

// Min-oriented version: same code with less() flipped.
template <typename Key>
class MinPQ {
private:
    std::vector<Key> pq{Key{}};
    size_t n = 0;
    bool greater(size_t i, size_t j) const { return pq[j] < pq[i]; }
    void exch(size_t i, size_t j) { std::swap(pq[i], pq[j]); }
    void swim(size_t k) {
        while (k > 1 && greater(k/2, k)) { exch(k, k/2); k = k/2; }
    }
    void sink(size_t k) {
        while (2*k <= n) {
            size_t j = 2*k;
            if (j < n && greater(j, j+1)) j++;
            if (!greater(k, j)) break;
            exch(k, j);
            k = j;
        }
    }
public:
    void insert(const Key& x) { pq.push_back(x); ++n; swim(n); }
    Key delMin() {
        Key min = pq[1];
        exch(1, n--);
        sink(1);
        pq.pop_back();
        return min;
    }
    void print() const {
        for (size_t i = 1; i <= n; i++) std::cout << pq[i] << ' ';
        std::cout << '\n';
    }
};

// Heap construction on a 1-based array a[1..n] (slide p17).
template <typename Key>
void sink(std::vector<Key>& a, size_t k, size_t n) {
    while (2*k <= n) {
        size_t j = 2*k;
        if (j < n && a[j] < a[j+1]) j++;
        if (!(a[k] < a[j])) break;
        std::swap(a[k], a[j]);
        k = j;
    }
}
template <typename Key>
void heapify(std::vector<Key>& a) {           // a[0] unused
    size_t n = a.size() - 1;
    for (size_t k = n/2; k >= 1; k--) {
        sink(a, k, n);
        std::cout << "  after sink(" << k << ", " << n << "): ";
        for (size_t i = 1; i <= n; i++) std::cout << a[i] << ' ';
        std::cout << '\n';
    }
}

int main() {
    std::vector<int> h = {100, 19, 36, 17, 3, 25, 1, 2, 7};

    MaxPQ<int> a; a.load(h); a.insert(47);
    std::cout << "insert 47: "; a.print();

    MaxPQ<int> b; b.load({19, 7, 36, 17, 3, 25, 1, 2}); b.sinkAt(2);
    std::cout << "sink 7:    "; b.print();

    MaxPQ<int> c; c.load(h);
    std::cout << "delMax -> " << c.delMax() << ", heap: "; c.print();

    MaxPQ<int> d; d.load(h);
    std::cout << "9 x delMax:";
    while (!d.isEmpty()) std::cout << ' ' << d.delMax();
    std::cout << '\n';

    MinPQ<char> m;
    std::cout << "Activity 2 (min-heap):\n";
    std::string ops[] = {"P","Q","E","-","X","A","M","-","P","L","E","-"};
    int step = 1;
    for (const std::string& op : ops) {
        std::cout << "  " << step++ << ". ";
        if (op == "-") std::cout << "delMin -> " << m.delMin() << " | ";
        else { m.insert(op[0]); std::cout << "insert " << op << " | "; }
        m.print();
    }

    std::vector<char> s = {' ', 'S','O','R','T','E','X','A','M','P','L','E'};
    std::cout << "heap construction:\n";
    heapify(s);
}
```

Output (`g++ -std=c++17 -Wall -fsanitize=address,undefined`):

```text
insert 47: 100 47 36 17 19 25 1 2 7 3 
sink 7:    19 17 36 7 3 25 1 2 
delMax -> 100, heap: 36 19 25 17 3 7 1 2 
9 x delMax: 100 36 25 19 17 7 3 2 1
Activity 2 (min-heap):
  1. insert P | P 
  2. insert Q | P Q 
  3. insert E | E Q P 
  4. delMin -> E | P Q 
  5. insert X | P Q X 
  6. insert A | A P X Q 
  7. insert M | A M X Q P 
  8. delMin -> A | M P X Q 
  9. insert P | M P X Q P 
  10. insert L | L P M Q P X 
  11. insert E | E P L Q P X M 
  12. delMin -> E | L P M Q P X 
heap construction:
  after sink(5, 11): S O R T L X A M P E E 
  after sink(4, 11): S O R T L X A M P E E 
  after sink(3, 11): S O X T L R A M P E E 
  after sink(2, 11): S T X P L R A M O E E 
  after sink(1, 11): X T S P L R A M O E E 
```

The slides' p17 loop uses `int k`; here `k` is `size_t` to match `n`. That is safe only because the loop stops at `k >= 1` — a `size_t` loop running down to 0 would wrap around instead of going negative.

## 10. In-class Activities (with Solutions)

All three heap exercises start from this max-heap (index: key):

| index | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|
| key | 100 | 19 | 36 | 17 | 3 | 25 | 1 | 2 | 7 |

### 10.1 Exercise: Heap Insertion (slide 5)

Insert 47 in this binary heap.

- **Task 1:** Show each step of the insert
- **Task 2:** Show the array representation of the resulting binary heap
- **Task 3:** What is the worst-case time complexity of insert?

> ✍️ **Try it first.** Hint: the new key goes into index 10 — whose child is that?

**Solution**

**Task 1:** 47 goes to `pq[10]`, the **left** child of index 5 (key 3), since 2·5 = 10. Swim: 47 > 3 → exchange (47 now at 5); 47 > 19 → exchange (47 now at 2); 47 < 100 → stop.

**Task 2:** `– 100 47 36 17 19 25 1 2 7 3`

**Task 3:** O(log n) — at most one exchange per level on the path to the root (≤ log n + 1 compares).

```viz binary-heap
{"title": "Exercise check: insert(47)", "heap": "100, 19, 36, 17, 3, 25, 1, 2, 7", "ops": "insert(47)"}
```

Back to [§1 Recap](#1-recap-insert-and-sink).

### 10.2 Exercise: Heap Sink (slide 6)

Sink 7 to its appropriate place in this binary heap: `– 19 7 36 17 3 25 1 2` (7 at index 2).

- **Task 1:** Show each step of the sink
- **Task 2:** Show the array representation of the resulting binary heap
- **Task 3:** What is the worst-case time complexity of sink?

> ✍️ **Try it first.**

**Solution**

**Task 1:** 7's children are 17 (index 4) and 3 (index 5); the larger is 17, and 7 < 17 → exchange (7 now at 4). Its only child is 2 (index 8); 7 > 2 → stop.

**Task 2:** `– 19 17 36 7 3 25 1 2`

**Task 3:** O(log n) — one level per exchange, two compares per level (≤ 2 log n compares).

```viz binary-heap
{"title": "Exercise check: sink(2)", "heap": "19, 7, 36, 17, 3, 25, 1, 2", "ops": "sink(2)"}
```

Back to [§1 Recap](#1-recap-insert-and-sink).

### 10.3 Activity 1: Delete the Maximum (slide 9)

Initial max-heap: the table above.

**(01) Single Delete** — call delete max and show the state of the heap.

**(02) Complexity** — what is the worst-case time complexity of deleteMax?

**(03) Array Trace** — call delete max 9 times on the original heap and show the values in the array.

> ✍️ **Try it first.** Hint: after the exchange, sink always moves toward the *larger* child.

**Solution**

**(01)** Exchange 100 with the last key 7 and remove 100. Sink 7: children 19 and 36 → exchange with 36 (7 at index 3); children 25 and 1 → exchange with 25 (7 at index 6); index 6 has no children → stop. Heap: `– 36 19 25 17 3 7 1 2`, returns 100.

**(02)** O(log n): one root-to-leaf path, at most 2 log n compares.

**(03)** The nine calls return `100 36 25 19 17 7 3 2 1` (decreasing order). Because each call parks the removed max at the end of the shrinking heap, the array itself becomes `– 1 2 3 7 17 19 25 36 100` — sorted ascending (the idea behind heap sort, [§7](#7-heap-sort-the-plan)).

Array after each call (`|` marks the end of the heap; keys to its right were removed and parked there by `exch(1, n--)`):

| Call | Returns | `pq[1..9]` |
|---|---|---|
| 1 | 100 | 36 19 25 17 3 7 1 2 \| 100 |
| 2 | 36 | 25 19 7 17 3 2 1 \| 36 100 |
| 3 | 25 | 19 17 7 1 3 2 \| 25 36 100 |
| 4 | 19 | 17 3 7 1 2 \| 19 25 36 100 |
| 5 | 17 | 7 3 2 1 \| 17 19 25 36 100 |
| 6 | 7 | 3 1 2 \| 7 17 19 25 36 100 |
| 7 | 3 | 2 1 \| 3 7 17 19 25 36 100 |
| 8 | 2 | 1 \| 2 3 7 17 19 25 36 100 |
| 9 | 1 | \| 1 2 3 7 17 19 25 36 100 |

The demo below drops each removed key from the drawing instead of parking it, so it ends with an empty heap; the table shows the slide's in-place array.

```viz binary-heap
{"title": "Activity 1 check: nine delMax() calls", "heap": "100, 19, 36, 17, 3, 25, 1, 2, 7", "ops": "delMax(); delMax(); delMax(); delMax(); delMax(); delMax(); delMax(); delMax(); delMax()"}
```

Back to [§2 Delete the maximum](#2-delete-the-maximum).

### 10.4 Activity 2: Assume Min-Heap (slide 14)

Perform the following operations in a PQ based on a heap (note: draw the contents of the heap at end of each step):

| | | | |
|---|---|---|---|
| 1. Insert P | 4. Delete min | 7. Insert M | 10. Insert L |
| 2. Insert Q | 5. Insert X | 8. Delete min | 11. Insert E |
| 3. Insert E | 6. Insert A | 9. Insert P | 12. Delete min |

> ✍️ **Try it first.** Hint: in a min-heap a key swims up while it is *smaller* than its parent.

**Solution** (heap array in level order after each step)

| Step | Operation | Returns | Heap |
|---|---|---|---|
| 1 | insert P | | P |
| 2 | insert Q | | P Q |
| 3 | insert E | | E Q P |
| 4 | delete min | E | P Q |
| 5 | insert X | | P Q X |
| 6 | insert A | | A P X Q |
| 7 | insert M | | A M X Q P |
| 8 | delete min | A | M P X Q |
| 9 | insert P | | M P X Q P |
| 10 | insert L | | L P M Q P X |
| 11 | insert E | | E P L Q P X M |
| 12 | delete min | E | L P M Q P X |

Key steps: in step 6, A swims from index 4 past Q and P to the root; in step 10, L swims past X and M to the root; in step 12, the last key M moves to the root and sinks to index 3. The demo in [§6](#6-min-heaps-and-delmin) steps through all twelve operations.

## 11. Quick Reference & Top 5 Things to Remember

| Operation (binary heap, n keys) | Worst case | Compares |
|---|---|---|
| insert (append + swim) | O(log n) | ≤ log n + 1 |
| delMax / delMin (exch + sink) | O(log n) | ≤ 2 log n |
| find max / min | O(1) | 0 |
| bottom-up heap construction | see Lecture 12 | sink each k from n/2 down to 1 |
| space | O(n) | |

| Priority queue | Insert | Delete max |
|---|---|---|
| Unordered array | O(1) | O(n) |
| Ordered array | O(n) | O(1) |
| Binary heap | O(log n) | O(log n) |

**Top 5 things to remember**

1. delMax: save `pq[1]`, `exch(1, n--)`, `sink(1)`, return — the old last key goes to the root and sinks.
2. Sink costs 2 compares per level (pick the larger child, then compare), swim costs 1 — hence 2 log n vs log n + 1.
3. A priority queue serves the best element first; a heap gives O(log n) for both insert and delete max, while arrays trade O(1) against O(n).
4. A min-heap is the same code with comparisons flipped: smallest at the root, sink toward the smaller child.
5. Bottom-up heap construction skips the leaves and sinks from k = n/2 down to 1, because ⌊n/2⌋ is the last node with a child.