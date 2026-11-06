---
title: "Trees"
summary: "Tree terminology (depth, height, degree), full vs complete binary trees, node-count and height bounds, the BinaryTree skeleton, level/pre/in/post-order traversals, and binary heaps: heap order, array representation, swim, insert and sink."
---

# Information and Computer Science 46 — Lecture 10: Trees

## Table of Contents

- [1. Trees: Hierarchical Data](#1-trees-hierarchical-data)
- [2. Tree Terminology](#2-tree-terminology)
- [3. Depth, Level and Height](#3-depth-level-and-height)
- [4. Full and Complete Binary Trees](#4-full-and-complete-binary-trees)
- [5. Counting Nodes and Height Bounds](#5-counting-nodes-and-height-bounds)
- [6. Skeleton Implementation](#6-skeleton-implementation)
- [7. Breadth-First: Level-Order Traversal](#7-breadth-first-level-order-traversal)
- [8. Depth-First: Pre-, In- and Post-Order](#8-depth-first-pre--in--and-post-order)
- [9. Heap-Ordered Binary Trees](#9-heap-ordered-binary-trees)
- [10. Array Representation of a Binary Heap](#10-array-representation-of-a-binary-heap)
- [11. Swim (Promote, Percolate Up)](#11-swim-promote-percolate-up)
- [12. Heap Insertion](#12-heap-insertion)
- [13. Sink (Demote, Top-Down Heapify)](#13-sink-demote-top-down-heapify)
- [14. Complete Implementation](#14-complete-implementation)
- [15. In-class Activities (with Solutions)](#15-in-class-activities-with-solutions)
- [16. Quick Reference & Top 5 Things to Remember](#16-quick-reference--top-5-things-to-remember)

> UCI ICS 46: Data Structure Implementation and Analysis — Prof. Tom Yeh, Fall 2026, 10/29/26
> Built from the Lecture 10 slides (which also carry the Trees section that first appeared at the end of the Lecture 9 deck), with algs4 §2.4 Priority Queues and §3.1 Symbol Tables as supplements. Organized by concept, not by source.

> 📅 **Class logistics**: Quiz 3 this Friday (Stacks, Queues, Deques) · HW 5 due Friday · Lab 4 due next Monday
> Quiz 2 graded (avg 79.5, max 100); HW 3 graded; Lab 2 grades after manual grading
> AI tool access needs the 2-part consent form (data storage is not used for academic integrity; research consent = 1% extra credit, alternative EC method later)

---

## 1. Trees: Hierarchical Data

Lists, stacks and queues are **linear**: every element has at most one predecessor and one successor. A **tree** is an abstract data type that stores elements **hierarchically**: each element has a **single parent** (its immediate ancestor) and **zero or more children** (its immediate descendants). Examples from the slides: an organization chart (CEO → CFO, CMO, COO, CTO → …), a website's sitemap (Home → About, Products, …), and a file system (`/` → Documents, Downloads, Music → …).

In CS we draw trees upside down: the **root** at the top, the **leaves** at the bottom.

**Definition (slide 7).** A tree $T$ is a set of nodes that store elements in a parent–child relationship such that

- if $T$ is non-empty, it has a special node, the **root**, that has no parent;
- every node $v$ other than the root has a **unique parent**.

Example (slide 7's tree diagram): root A; A's children B and C; B has only a right child D; C's children E and F; E has a left child G; F's children H and I. Step through it (← / → keys work when the demo is focused):

```viz binary-tree
{"title": "Slide 7: the tree diagram", "tree": "A, B, C, -, D, E, F, -, -, -, -, G, -, H, I", "views": "root; parent:C; ancestors:G"}
```

## 2. Tree Terminology

All examples use the slides' **example tree** (slides 8–9, 13–14, 18, 21–25):

| Node | K | C | N | A | F | M | V | B | D | H | U |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Left child | C | A | M | — | D | — | U | — | — | — | — |
| Right child | N | F | V | B | H | — | — | — | — | — | — |

| Term | Meaning | Example |
|---|---|---|
| Edge | a pair of connected nodes | (K, C) |
| Parent / child | node directly above / below | K is the parent of C and N |
| Siblings | nodes with the same parent | A and F |
| Ancestor / descendant | anywhere above / below on the path to the root | K is an ancestor of B; B is a descendant of K |
| Subtree | a node plus all of its descendants | subtree at N = {N, M, V, U} |
| Leaf (external node) | no children | {B, D, H, M, U} |
| Internal node | at least one child | {K, C, N, A, F, V} |
| Forest | a set of disjoint trees | |
| Simple path | distinct nodes with an edge between each consecutive pair | K-N-V-U |
| Path length | number of **edges** on the path | K-C-A has length 2 |
| Height of a node | length of the longest path from it down to a leaf | height(C) = 2 (C-F-D) |
| Height of the tree | longest root-to-leaf path = height of the root | 3 (e.g. K-C-A-B) |
| Degree of a node | number of its children | degree(C) = 2 |
| Degree (arity) of a tree | max degree of any node | 2 |
| Binary tree | a tree with arity 2: each node has at most 2 children, each in a **left** or **right** slot | |

Each term on the example tree, one step per term:

```viz binary-tree
{"title": "Slides 8–9, 13: terminology on the example tree", "tree": "K, C, N, A, F, M, V, -, B, D, H, -, -, U", "views": "parent:K; siblings:A; ancestors:B; subtree:N; leaves; internal; path:K-N-V-U; path:K-C-A; degree"}
```

> ⚠️ **Pitfall**: Slide 9's "Quick Checks" answer lists the leaves as {B, D, H, M, U, V} and the internal nodes as {K, C, N, A, F}. V has a child (U), so V is **internal**: leaves {B, D, H, M, U}, internal {K, C, N, A, F, V}.

## 3. Depth, Level and Height

**Depth (= level)** of a node: its distance (number of edges) from the root. The root is at depth/level 0. The **depth of a binary tree** is the maximum level of all its nodes, and a node with the maximum depth is always a leaf.

**Height** is measured the other way, from the bottom:

- a leaf has height 0;
- any other node has height 1 + the maximum height of its non-null children.

The **height of the tree** is the height of its root. So depth counts down from the root, height counts up from the leaves, and for the whole tree the two agree (max depth = height of the root).

Example (slides 11–12): in the slide's 10-node tree the leaves are labelled 0, their parents 1 and 2, and the root 3; the deepest leaves sit at depth 3, so tree depth = tree height = 3. In the example tree from §2: depth(F) = 2, height(F) = 1, height(K) = 3.

Depth (badges counted down from the root) and height (counted up from the leaves) on the example tree — the slide's own 10-node tree has a node with three children, so it isn't a binary tree:

```viz binary-tree
{"title": "Slides 10–12: depth vs height", "tree": "K, C, N, A, F, M, V, -, B, D, H, -, -, U", "views": "depth; height"}
```

> ⚠️ **Pitfall**: Depth and height are counted in **edges**, not nodes. A single-node tree has height 0; with the recursive formula an empty tree is given height −1 so that a leaf comes out as 1 + max(−1, −1) = 0 (see `height()` in §14).

## 4. Full and Complete Binary Trees

- **Full (proper)** binary tree: every node has **0 or 2** children — never exactly one.
- **Complete** binary tree: has minimal height — every level is full except possibly the last, and the nodes on the last level are **as far left as possible** (no holes in level order).

The two properties are independent (slide 15 shows one tree of each kind):

| | Full | Not full |
|---|---|---|
| **Complete** | every level full, or last level left-packed with pairs | last level ends with a lone left child |
| **Not complete** | some leaf missing on an upper level, or a gap on the last level, but no node with one child | e.g. a node with one child *and* a gap |

Slide 15's four shapes, then the example tree — nodes with one child are marked purple for *full*, gaps in level order show as dashed slots for *complete*:

```viz binary-tree
{"title": "Slide 15: complete and full", "tree": "Neither complete nor full = A, B, C, D, E, F, G, H, -, -, -, I, J | Complete but not full = A, B, C, D, E, F, G, H | Full but not complete = A, B, C, D, E, F, G, H, I, -, -, J, K | Complete and full = A, B, C, D, E, F, G, H, I | Example tree = K, C, N, A, F, M, V, -, B, D, H, -, -, U", "views": "full; complete"}
```

The example tree from §2 is **neither**: A and V have one child each (not full), and its last level has a hole where A's left child would be (not complete).

> 📝 **Practice**: [Practice Time](#152-practice-time-full-or-complete-slides-1617) — two trees to classify.

## 5. Counting Nodes and Height Bounds

**Lemma.** A binary tree has at most $2^k$ nodes on level $k$ (each level can at most double). Level 2 of the example tree holds the maximum $2^2 = 4$: A, F, M, V.

**Theorem.** A binary tree of height $h$ with $n$ nodes satisfies

$$h + 1 \le n \le 2^{h+1} - 1 \qquad\Longleftrightarrow\qquad \log_2(n+1) - 1 \le h \le n - 1$$

- **Minimum** $n = h + 1$: a "stick" — every node has one child, the tree is a linked list. So the **worst-case height is $n - 1 = O(n)$**.
- **Maximum** $n = 1 + 2 + 4 + \dots + 2^h = 2^{h+1} - 1$: every level full. So the **best-case height is $O(\log n)$**, reached by compact (complete) trees.

Example: 7 nodes can have height anywhere from 2 (all three levels full) to 6 (a stick).

```viz binary-tree
{"title": "Slide 18: fewest vs most nodes for the same height h = 2", "tree": "h = 2, most nodes (7) = A, B, C, D, E, F, G | h = 2, fewest nodes (3, a stick) = A, B, -, C", "views": "depth"}
```

> 💡 **Key Insight**: Every tree operation that walks one root-to-leaf path costs O(height) — between O(log n) and O(n). Keeping trees short is what balanced trees (Lec 13) and heaps (§9) are about.

> ⚠️ **Pitfall**: Slide 18 labels the upper bound "MAX (complete)". $2^{h+1} - 1$ nodes needs **every** level full (a *perfect* tree); a complete tree of height $h$ can have anywhere from $2^h$ to $2^{h+1} - 1$ nodes.

## 6. Skeleton Implementation

Like the linked list, a binary tree is a set of `Node` objects linked by pointers, but each node has **two** links:

```cpp
template <typename Item>
class BinaryTree {
private:
    // Nested Node class
    class Node {
    public:
        Item item;      // Payload
        Node* left;     // Pointer to left child
        Node* right;    // Pointer to right child

        // Node constructor
        Node(Node* leftNode, Node* rightNode, const Item& value)
            : item(value), left(leftNode), right(rightNode) {}
    };

    Node* root; // Pointer to the root node of the tree
};
```

The picture on slide 19 names the parts: `root` points at the top node; each `left`/`right` pointer is a **link**; any node together with everything below it is a **subtree** (so every link points at a subtree — that's why tree code is naturally recursive); a **leaf** is a node whose two links are both **null links** (`nullptr`).

```viz binary-tree
{"title": "Slide 19: root, subtree and null links", "tree": "K, C, N, A, F, M, V, -, B, D, H, -, -, U", "views": "root; subtree:C; nulls"}
```

Example: a 3-node tree is `new Node(new Node(nullptr, nullptr, "A"), new Node(nullptr, nullptr, "C"), "B")` — note the constructor takes the children **first** and the value last.

## 7. Breadth-First: Level-Order Traversal

Linear structures have one natural order; trees can be traversed in several (slide 20):

- **breadth-first**: level order;
- **depth-first**: pre-order, in-order, post-order (§8).

**Level order**: mark the nodes of level $i$ as visited, left to right, before any node of level $i + 1$, starting at level 0. On the example tree: **K C N A F M V B D H U**.

The slides give the order, not code; the standard implementation (mine) uses a FIFO queue from Lec 5: pop a node, visit it, push its children.

```cpp
void levelorder() const {
    std::queue<Node*> q;
    if (root) q.push(root);
    while (!q.empty()) {
        Node* t = q.front(); q.pop();
        visit(t->item);
        if (t->left)  q.push(t->left);
        if (t->right) q.push(t->right);
    }
}
```

Step through it below (← / → keys work when the demo is focused):

```viz tree-traversal
{"title": "Slide 21: level order of the example tree", "tree": "K, C, N, A, F, M, V, -, B, D, H, -, -, U", "order": "level", "interactive": true}
```

Each node enters and leaves the queue once, so the traversal is O(n).

> ⚠️ **Pitfall**: Slide 21 (level order) has the note "provides sorted order for Binary Search Trees". That is **in-order** (slide 24, §8); level order of a BST is not sorted.

## 8. Depth-First: Pre-, In- and Post-Order

All three visit the root and recursively traverse the left subtree, then the right subtree. The prefix says **when the root is marked visited**: **pre** = before both subtrees, **in** = between them, **post** = after both.

| Traversal | Recursion | Example tree | Typical use (slides) |
|---|---|---|---|
| Pre-order | root, Preorder(left), Preorder(right) | K C A B F D H N M V U | process a parent before its children, e.g. **copy** a tree |
| In-order | Inorder(left), root, Inorder(right) | A B C D F H K M N U V | on a binary search tree gives **sorted order** (e.g. find the kth smallest) |
| Post-order | Postorder(left), Postorder(right), root | B A D H F C M U V N K | process both subtrees before the parent, e.g. **deletion** |

As code (mine — the slides give the recursion in words), only the position of `visit` changes:

```cpp
void preorder(Node* t) {
    if (t == nullptr) return;
    visit(t->item);          // root first
    preorder(t->left);
    preorder(t->right);
}
// inorder:   inorder(t->left);  visit(t->item);  inorder(t->right);
// postorder: postorder(t->left); postorder(t->right); visit(t->item);
```

Step through the in-order traversal (the call stack is shown in orange):

```viz tree-traversal
{"title": "Slide 24: in-order of the example tree", "tree": "K, C, N, A, F, M, V, -, B, D, H, -, -, U", "order": "in", "interactive": true}
```

Every node gets exactly one call (plus one call per null link), so each traversal is O(n) time; the call stack holds one frame per level, O(height) extra space.

> 💡 **Key Insight**: A quick way to check by hand: in pre-order the **root is first**, in post-order the **root is last**, and in in-order the root **splits** the left subtree's nodes from the right subtree's (A B C D F H | K | M N U V).

> 📝 **Practice**: [Activity 1](#151-activity-1-list-the-nodes-in-all-four-orders-slide-26) — all four orders of a new tree.

## 9. Heap-Ordered Binary Trees

**Definition.** A binary tree is **heap-ordered** if the key in each node is **≥ the keys in its two children** (if any). Equivalently, each node's key is ≤ its parent's key. Consequences (slide 27):

- **No child assumption**: nothing says whether the left or the right child is smaller.
- Moving **up** from any node gives a **non-decreasing** sequence of keys; moving **down** gives a non-increasing one.
- So the **largest key is at the root**.

That is a **max-heap**. Flip every comparison and you get a **min-heap** (parent ≤ children, smallest key at the root). Slide 28's examples:

| | Root | Level 1 | Level 2 | Level 3 |
|---|---|---|---|---|
| Max-heap | 100 | 19, 28 | 17, 3 (under 19) · 25, 1 (under 28) | 2, 7 (under 17) |
| Min-heap | 1 | 3, 2 | 7, 19 (under 3) · 25, 28 (under 2) | 17, 100 (under 7) |

Heap order only constrains each parent–child pair, not nodes on different paths: in the max-heap, 3 (level 2) is smaller than 7 (level 3), which is fine because 7 hangs under 17, not under 3.

> 📘 **Beyond the lecture**: In a heap of n keys about half the nodes (⌈n/2⌉) are leaves, and the **minimum of a max-heap can be any of them** — finding it takes O(n). A heap is only "sorted" along each root-to-leaf path. (algs4 §2.4 web exercises)

## 10. Array Representation of a Binary Heap

A **binary heap** is a heap-ordered **complete** binary tree stored in an array in **level order**:

- nothing at index 0; the root is at index 1;
- the rest follow level by level, left to right;
- because the tree is complete there are no holes, so **no wasted space** and **no pointers** (a pointer-based tree spends three pointers — parent, left, right — per node).

**Index math (1-based):** for the node at index $k$

$$\text{parent} = \lfloor k/2 \rfloor, \qquad \text{children} = 2k \text{ and } 2k + 1$$

Moving up or down the tree is just arithmetic on indices — direct indexed access is much faster than following pointers, the same advantage an ArrayList has over a linked list.

Example (slide 29), max-heap 100 / 19, 36 / 17, 3, 25, 1 / 2, 7:

| index | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|---|
| pq[i] | – | 100 | 19 | 36 | 17 | 3 | 25 | 1 | 2 | 7 |

Check: 17 is at index 4 → parent ⌊4/2⌋ = 2 (19), children 8 and 9 (2 and 7). Slide 30's letter heap is `– T S R P N O A E I H G` (T root; S, R; P, N, O, A; E, I, H, G).

> 📘 **Beyond the lecture**: An array sorted in **decreasing** order is always a valid max-heap: every parent index k is smaller than its children's indices 2k and 2k+1, so its key is at least as large. (algs4 §2.4 exercise)

## 11. Swim (Promote, Percolate Up)

**Scenario:** a key becomes **larger than its parent**, violating heap order. **Fix:** exchange it with its parent, and repeat until heap order is restored (it reaches a larger parent, or the root). Also called *reheapify bottom-up*.

```cpp
void swim(size_t k) {
    while (k > 1 && less(k/2, k)) {
        exch(k, k/2);
        k = k/2;
    }
}
```

`less(i, j)` compares `pq[i] < pq[j]` and `exch(i, j)` swaps them (the same helpers as in the sorting lectures). Slide 32–33's example: the key at index 5 becomes T in `– S P R G T O A E I H G`; T swaps with P (index 2), then with S (index 1):

```viz binary-heap
{"title": "Slides 32–33: swim(5)", "heap": "S, P, R, G, T, O, A, E, I, H, G", "ops": "swim(5)"}
```

Result: `– T S R G P O A E I H G`. Each iteration moves up one level, so swim is O(log n) (height of a complete tree).

> 📘 **Beyond the lecture**: Why one exchange never breaks order *below*: after swapping, the risen key is larger than its old parent (that's why it moved) and therefore larger than the old parent's other child too. The only possible new violation is with the next parent up — which is exactly what the loop checks. (algs4 §2.4)

## 12. Heap Insertion

**Insert:** add the new key **at the end of the bottom level** (the next free array slot, which keeps the tree complete), then **swim it up**.

```cpp
void insert(const Key& x) {
    pq[++n] = x;
    swim(n);
}
```

**Cost:** at most $\log n + 1$ compares — one per level on the path to the root.

Example (slide 34): insert S into `– T P R N H O A E I G`. S lands at index 11 (child of H); S > H → exchange; S > P → exchange; S < T → stop. Result `– T S R N P O A E I G H`.

```viz binary-heap
{"title": "Slide 34: insert(S)", "heap": "T, P, R, N, H, O, A, E, I, G", "ops": "insert(S)", "interactive": true}
```

> ⚠️ **Pitfall**: `pq[++n]` is **pre**-increment: n becomes the new size first, then the key goes into `pq[n]`. With `pq[n++] = x` the key would go into the old `pq[n]` and **overwrite the last key**, because the heap lives in `pq[1..n]` (index 0 unused).

## 13. Sink (Demote, Top-Down Heapify)

**Scenario:** a key becomes **smaller than one (or both) of its children**. **Fix:** exchange it with its **larger** child, and repeat until heap order is restored (both children smaller, or it reaches the bottom).

```cpp
void sink(int k) {
    while (2*k <= n) {
        int j = 2*k;
        if (j < n && less(j, j+1))
            j++;
        if (!less(k, j))
            break;
        exch(k, j);
        k = j;
    }
}
```

Line by line: `2*k <= n` — k still has a left child; `j = 2*k` — start at the left child; `j < n && less(j, j+1)` — if a right child exists and is larger, use it; `!less(k, j)` — k is not smaller than its larger child, done; otherwise exchange and continue from j.

Example (slide 36): in `– T H R P S O A E I N G` the key H at index 2 is smaller than its children P and S. H swaps with S (index 5), then with N (index 10), and stops at the bottom. Result `– T S R P N O A E I H G`.

```viz binary-heap
{"title": "Slide 36: sink(2)", "heap": "T, H, R, P, S, O, A, E, I, N, G", "ops": "sink(2)"}
```

Sink also walks one root-to-leaf path: O(log n), with **2 compares per level** (pick the larger child, then compare with it).

> ⚠️ **Pitfall**: Exchange with the **larger** child, not the left one. If H swapped with P instead of S, P would end up above S — a new violation.

> ➡️ **Continued in [Lecture 11](lec-11.en-US.md)**: the heap activities (insert 47, sink 7, delete max), `delMax()`, the runtime summary and the algs4 binary-heap demo — the Lecture 11 deck repeats them.

## 14. Complete Implementation

```cpp
#include <algorithm>
#include <iostream>
#include <queue>
#include <string>
#include <utility>
#include <vector>

template <typename Item>
class BinaryTree {
private:
    class Node {
    public:
        Item item;
        Node* left;
        Node* right;
        Node(Node* leftNode, Node* rightNode, const Item& value)
            : item(value), left(leftNode), right(rightNode) {}
    };
    Node* root;

    // pos[1] = root, children of p at 2p, 2p+1, "-" = empty
    static Node* build(const std::vector<std::string>& pos, size_t p) {
        if (p >= pos.size() || pos[p] == "-") return nullptr;
        return new Node(build(pos, 2 * p), build(pos, 2 * p + 1), pos[p]);
    }
    static void destroy(Node* t) {          // post-order
        if (t == nullptr) return;
        destroy(t->left);
        destroy(t->right);
        delete t;
    }
    static void preorder(Node* t) {
        if (t == nullptr) return;
        std::cout << t->item << ' ';
        preorder(t->left);
        preorder(t->right);
    }
    static void inorder(Node* t) {
        if (t == nullptr) return;
        inorder(t->left);
        std::cout << t->item << ' ';
        inorder(t->right);
    }
    static void postorder(Node* t) {
        if (t == nullptr) return;
        postorder(t->left);
        postorder(t->right);
        std::cout << t->item << ' ';
    }
    static int height(Node* t) {             // empty = -1, leaf = 0
        if (t == nullptr) return -1;
        return 1 + std::max(height(t->left), height(t->right));
    }
    static int size(Node* t) {
        return t == nullptr ? 0 : 1 + size(t->left) + size(t->right);
    }

public:
    explicit BinaryTree(const std::vector<std::string>& pos) : root(build(pos, 1)) {}
    ~BinaryTree() { destroy(root); }
    BinaryTree(const BinaryTree&) = delete;
    BinaryTree& operator=(const BinaryTree&) = delete;

    void preorder() const { preorder(root); std::cout << '\n'; }
    void inorder() const { inorder(root); std::cout << '\n'; }
    void postorder() const { postorder(root); std::cout << '\n'; }
    void levelorder() const {
        std::queue<Node*> q;
        if (root) q.push(root);
        while (!q.empty()) {
            Node* t = q.front(); q.pop();
            std::cout << t->item << ' ';
            if (t->left)  q.push(t->left);
            if (t->right) q.push(t->right);
        }
        std::cout << '\n';
    }
    int height() const { return height(root); }
    int size() const { return size(root); }
};

template <typename Key>
class MaxHeap {
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
    void insert(const Key& x) {
        pq.push_back(x);              // slide: pq[++n] = x;
        ++n;
        swim(n);
    }
    void print() const {
        for (size_t i = 1; i <= n; i++) std::cout << pq[i] << ' ';
        std::cout << '\n';
    }
    void load(const std::vector<Key>& keys) {   // as-is, for the sink demo
        pq.assign(1, Key{});
        pq.insert(pq.end(), keys.begin(), keys.end());
        n = keys.size();
    }
    void sinkAt(size_t k) { sink(k); }
};

int main() {
    BinaryTree<std::string> t({"", "K", "C", "N", "A", "F", "M", "V",
                               "-", "B", "D", "H", "-", "-", "U"});
    std::cout << "pre:   "; t.preorder();
    std::cout << "in:    "; t.inorder();
    std::cout << "post:  "; t.postorder();
    std::cout << "level: "; t.levelorder();
    std::cout << "size " << t.size() << ", height " << t.height() << '\n';

    MaxHeap<char> h;
    for (char c : std::string("TPRNHOAEIG")) h.insert(c);
    std::cout << "heap:  "; h.print();
    h.insert('S');
    std::cout << "+S:    "; h.print();

    MaxHeap<char> s;
    s.load({'T','H','R','P','S','O','A','E','I','N','G'});
    s.sinkAt(2);
    std::cout << "sink2: "; s.print();
}
```

Output (`g++ -std=c++17 -Wall -fsanitize=address,undefined`):

```text
pre:   K C A B F D H N M V U
in:    A B C D F H K M N U V
post:  B A D H F C M U V N K
level: K C N A F M V B D H U
size 11, height 3
heap:  T P R N H O A E I G
+S:    T S R N P O A E I G H
sink2: T S R P N O A E I H G
```

The heap here uses a growing `std::vector` instead of a fixed array, and `size_t` for both `swim` and `sink` (the slides use `size_t` in `swim` but `int` in `sink`; mixing `int k` with a `size_t n` gives a signed/unsigned comparison warning).

## 15. In-class Activities (with Solutions)

### 15.1 Activity 1: List the nodes in all four orders (slide 26)

List the nodes in pre-order, in-order, post-order, and level order:

| Node | 8 | 5 | 4 | 9 | 7 | 11 | 1 | 12 | 3 | 2 |
|---|---|---|---|---|---|---|---|---|---|---|
| Left child | 5 | 9 | — | — | 1 | 3 | — | 2 | — | — |
| Right child | 4 | 7 | 11 | — | 12 | — | — | — | — | — |

(Root 8; 5 has children 9 and 7; 7 has children 1 and 12; 12 has a left child 2; 4 has only a right child 11; 11 has a left child 3.)

> ✍️ **Try it first.** Hint: 4 has no left child and 11 has no right child — when the recursion reaches them, the missing side returns immediately.

**Solution**

| Order | Sequence |
|---|---|
| Pre-order | 8 5 9 7 1 12 2 4 11 3 |
| In-order | 9 5 1 7 2 12 8 4 3 11 |
| Post-order | 9 1 2 12 7 5 3 11 4 8 |
| Level order | 8 5 4 9 7 11 1 12 3 2 |

Checks: pre-order starts with the root 8, post-order ends with it; in-order puts 8 between the left subtree (9 5 1 7 2 12) and the right subtree (4 3 11). In in-order, 4 comes **before** 3 and 11 because it has no left subtree; in level order, 3 (level 3, under 11) comes **after** 1 and 12 and 2 is last (level 4). Check the post-order here:

```viz tree-traversal
{"title": "Activity 1 check: post-order", "tree": "8, 5, 4, 9, 7, -, 11, -, -, 1, 12, -, -, 3, -, -, -, -, -, -, -, 2", "order": "post"}
```

Back to [§8 Depth-first traversals](#8-depth-first-pre--in--and-post-order).

### 15.2 Practice Time: Full or complete? (slides 16–17)

**(a)** A root with two children; the left child has two children (leaves); the right child has one child, on its left. Is the tree A: Full, B: Complete, C: Full and Complete, D: Neither Full nor Complete?

**(b)** A root with a single child, on its **right**. Same choices.

> ✍️ **Try it first.**

**Solution**

**(a) B: Complete.** Levels 0 and 1 are full and the last level (three leaves) is packed to the left. Not full: the root's right child has exactly one child.

**(b) D: Neither.** The root has exactly one child (not full), and the last level's only node is on the right, leaving a hole on the left (not complete). A root whose only child is on the **left** would be complete.

```viz binary-tree
{"title": "Practice check: (a) and (b)", "tree": "(a) = A, B, C, D, E, F | (b) = A, -, B", "views": "full; complete"}
```

Back to [§4 Full and complete](#4-full-and-complete-binary-trees).

## 16. Quick Reference & Top 5 Things to Remember

| Operation | Cost | Why |
|---|---|---|
| Pre/in/post/level-order traversal | O(n) | one visit per node |
| Height of a binary tree with n nodes | between ⌈log₂(n+1)⌉ − 1 and n − 1 | complete vs stick |
| Max nodes on level k / in a tree of height h | 2^k / 2^(h+1) − 1 | each level doubles |
| Heap: find max | O(1) | it's `pq[1]` |
| Heap: swim, sink | O(log n) | one root-to-leaf path in a complete tree |
| Heap: insert | O(log n), ≤ log n + 1 compares | append + swim |

| Heap index math (1-based) | |
|---|---|
| parent of k | ⌊k/2⌋ |
| children of k | 2k, 2k + 1 |
| root / unused | 1 / 0 |

**Top 5 things to remember**

1. Depth counts edges down from the root (root = 0); height counts edges up from the deepest leaf (leaf = 0); tree height = height of the root.
2. Full = every node has 0 or 2 children; complete = all levels full except the last, which is filled from the left — they are independent.
3. Pre = root first, in = root in the middle, post = root last; in-order of a BST is sorted, level order uses a queue.
4. A binary heap is a complete, heap-ordered tree in an array from index 1: parent k/2, children 2k and 2k+1.
5. Swim: swap with the parent while larger (used by insert); sink: swap with the **larger** child while smaller — both O(log n).
