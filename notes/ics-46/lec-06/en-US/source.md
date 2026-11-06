# Information and Computer Science 46 — Lecture 6: Analysis of Recursion

## Table of Contents

- [1. Abstract Data Types vs Data Structures](#1-abstract-data-types-vs-data-structures)
- [2. Why Analyze Recursion](#2-why-analyze-recursion)
- [3. The Two-Step Recipe](#3-the-two-step-recipe)
- [4. Setting Up a Recurrence: Factorial](#4-setting-up-a-recurrence-factorial)
- [5. Method A: Recursion Tree for Factorial](#5-method-a-recursion-tree-for-factorial)
- [6. Recursion Tree for a Divide-in-Half Recurrence](#6-recursion-tree-for-a-divide-in-half-recurrence)
- [7. Method B: The Master Theorem](#7-method-b-the-master-theorem)
- [8. In-class Activities (with Solutions)](#8-in-class-activities-with-solutions)
- [9. Quick Reference & Top 5 Things to Remember](#9-quick-reference--top-5-things-to-remember)

> UCI ICS 46: Data Structure Implementation and Analysis — Prof. Tom Yeh, Fall 2026, 10/15/26
> Built from the Lecture 6 slides (pages 1–17; the deck's sorting part, pages 18–39, is repeated in Lecture 7 and lives in those notes), with Alex Thornton's ICS 46 notes "Asymptotic Analysis of Recursion" as a supplement. Organized by concept, not by source.

> 📅 **Class logistics**: Learning Activity 2 on Fri 10/16 — come prepared: charged laptop, extension installed, random ID entered.
> Quiz 2 next Fri 10/23: Algorithm Analysis, ArrayList, Linked List.
> HW 2 due Fri 10/16; Lab 2 due Mon 10/19.

---

## 1. Abstract Data Types vs Data Structures

The lecture opens by separating **what** a collection does from **how** it is built.

- An **abstract data type (ADT)** is the *what*: which data is stored and which operations exist. It is a behavioral contract and says nothing about memory layout.
- A **data structure (DS)** is the *how*: how the data is organized, stored and manipulated. It is about memory layout, efficiency and the algorithms behind each operation.

| ADT (the "what") | Operations | Data structures that implement it (the "how") |
|---|---|---|
| List | `add()`, `remove()`, `get()` on an ordered collection | ArrayList (dynamically resizing array), LinkedList (node pointers) |
| Stack | LIFO: `push()`, `pop()`, `peek()` | array-based stack, linked stack (singly-linked nodes) |
| Queue | FIFO: `enqueue()`, `dequeue()` | circular array (ring buffer), linked queue (head/tail pointers) |

Example: "a Stack" on a quiz means the ADT; "a linked stack whose top is the head" is one data structure for it. Its `push` is O(1) because of the *structure*, not because of the ADT.

---

## 2. Why Analyze Recursion

Some algorithms and data structures are best written recursively, so we need to find their running time just as we did for loops. The slide's example:

```cpp
int factorial(int n)
{
    if (n == 0)
        return 1;
    else
        return n * factorial(n - 1);
}
```

**What is the worst-case time complexity?** O(n). `factorial(n)` makes n multiplications and n + 1 calls in total (`factorial(n)`, `factorial(n-1)`, …, `factorial(0)`), each doing constant work.

> ⚠️ **Pitfall**: "No loops, so O(1)" is wrong. The work is hidden in the recursive call: `factorial(10)` clearly does more than `factorial(5)`. Always ask how many calls happen and what each one costs.

---

## 3. The Two-Step Recipe

To find the time complexity of a recursive algorithm:

1. **Set up a recurrence**: an equation that expresses the running time T(n)
   - in terms of one or more subproblems of size < n,
   - plus any additional work done outside the recursive calls.
2. **Solve the recurrence** (approximately), using one of two methods:
   - **Method A — Recursion-tree method** (sections 5–6)
   - **Method B — Master theorem** (section 7)

Every recurrence also needs a **base case** (e.g. T(0) or T(1)), which is a constant.

---

## 4. Setting Up a Recurrence: Factorial

For the `factorial` function above:

```text
T(0) = a
T(n) = b + T(n - 1)      for n > 0
```

- **T(0)** is the time when `n == 0`. **a** is the constant time to check `n == 0` and return 1.
- For **n > 0**, **b** is the constant time for everything *except* the recursive call (the check, `n - 1`, the multiply, the return).
- **T(n − 1)** is the time of the recursive call. It is described by the same recurrence.

Reading a recurrence off code: count the recursive calls (here one), write the size each one gets (here n − 1), and add the cost of the rest of the body (here the constant b).

> 📘 **Beyond the lecture** (Thornton, *Asymptotic Analysis of Recursion*): another way to solve it is **repeated substitution**. Keep substituting until a pattern shows:
> T(n) = b + T(n−1) = 2b + T(n−2) = 3b + T(n−3) = … = jb + T(n−j).
> (The pattern can be proven for all j by induction.) Choose j = n to reach the base case: T(n) = nb + T(0) = **nb + a**, which grows linearly, so T(n) is Θ(n). The recursion tree in the next section reaches the same sum by drawing it.

---

## 5. Method A: Recursion Tree for Factorial

Draw one node per call, put the work each call does *outside* its recursive calls next to it, and add everything up. For `factorial(5)` (slide p9) the "tree" is a chain:

| Call | Level | Recurrence term | Work at this node |
|---|---|---|---|
| `factorial(5) = 5 * factorial(4)` | 0 | T(n) | b |
| `factorial(4) = 4 * factorial(3)` | 1 | T(n−1) | b |
| `factorial(3) = 3 * factorial(2)` | 2 | T(n−2) | b |
| `factorial(2) = 2 * factorial(1)` | 3 | T(n−3) | b |
| `factorial(1) = 1 * factorial(0)` | 4 | T(n−4) | b |
| `factorial(0) = 1` | base | T(0) = constant | a |

- There are **n levels** (plus the base case).
- Each level takes constant time b.
- T(n) = levels × time per level = n·b (+ a) ⇒ **O(n)**.

Step through it below (← / → keys work when the demo is focused):

```viz recursion-tree
{"title": "Slide p9: factorial(5) as a recursion tree", "recurrence": "T(n) = b + T(n-1)", "n": 5, "base": "a", "code": "factorial"}
```

Counting the calls in real code agrees: an instrumented `factorial` (a `++calls` at the top) prints

```text
factorial(5) = 120, calls = 6
```

That is n + 1 = 6 calls: five with cost b, one base case with cost a.

---

## 6. Recursion Tree for a Divide-in-Half Recurrence

Slides p10–12 analyze an "unknown algorithm" that splits its input in half twice and does linear work at each call:

```text
T(n) = 2T(n/2) + n
T(1) = c,  where c is a constant
```

**The rule of the method (slide p12):** charge each operation to the function call (tree node) where it is executed. Work done inside further recursive calls is counted separately, at *their* nodes. So the node for an input of length m is charged m (the "+ n" term evaluated at its own size), and never more.

| Level | Calls | Input size each | Work per call | Level total |
|---|---|---|---|---|
| 0 | 1 | n | n | n |
| 1 | 2 | n/2 | n/2 | n |
| 2 | 4 | n/4 | n/4 | n |
| 3 | 8 | n/8 | n/8 | n |
| … | … | … | … | n |
| log₂ n (leaves) | 2^(log₂ n) = n | 1 | c | c·n |

- The size halves on each level, so it reaches 1 after **log₂ n** halvings. The tree has height log₂ n, so there are log₂ n + 1 levels counting the leaf level.
- There are **n leaves**, each a base case T(1) = c.
- Each non-leaf level costs **n** in total: 2^i calls × n/2^i each.
- Total: n·log₂ n + c·n ⇒ **O(n log n)**.

Step through it below. The input bar lets you type any recurrence of the form aT(n/b) + f(n) (for example, the ones in Activity 2):

```viz recursion-tree
{"title": "Slides p10–12: T(n) = 2T(n/2) + n, drawn for n = 8", "recurrence": "T(n) = 2T(n/2) + n", "n": 8, "interactive": true}
```

A real function with exactly this shape, counting one unit for each "+ n" step and one for each base case (c = 1):

```cpp
long work = 0;

void unknown(int n)                      // T(n) = 2T(n/2) + n
{
    if (n == 1) { ++work; return; }      // base case: c
    for (int i = 0; i < n; ++i) ++work;  // the "+ n"
    unknown(n / 2);
    unknown(n / 2);
}
```

```text
unknown(8): work = 32
unknown(16): work = 80
unknown(1024): work = 11264
```

Each matches n·log₂ n + n: 8·3 + 8 = 32, 16·4 + 16 = 80, 1024·10 + 1024 = 11264.

> 💡 **Key Insight**: For a recursion tree you need three numbers: how many levels, how many nodes per level, and how much work each node does. Total = the sum of the level totals.

> 📝 **Practice**: [Activity 0](#81-activity-0-how-many-levels-and-leaves-slide-11) asks for the levels and leaves of this tree. [Activity 1](#82-activity-1-recursion-tree-method-slide-13) uses the method on binary search and on 2T(n/2) + c.

---

## 7. Method B: The Master Theorem

### 7.1 The formula

The master theorem is a formula that solves recurrences in which **all subproblems are the same size**. It packages the recursion-tree method into a plug-and-play result, so it is faster than drawing the tree.

Suppose $T(n) = a \cdot T(n/b) + O(n^d)$. Then

$$
T(n) = \begin{cases}
O(n^d \log n) & \text{if } a = b^d \\
O(n^d) & \text{if } a < b^d \\
O(n^{\log_b a}) & \text{if } a > b^d
\end{cases}
$$

Three parameters:

- **a**: number of subproblems (recursive calls per call)
- **b**: factor by which the input size shrinks (each subproblem has size n/b)
- **d**: the non-recursive work is n^d, i.e. the work to create all the subproblems and combine their solutions

To use it, read off a, b, d, compute b^d, and compare it with a.

> ⚠️ **Pitfall**: constant extra work, O(1) or "+ c", means **d = 0** (n⁰ = 1), so b^d = 1. In T(n) = 2T(n/2) + c the comparison is 2 vs 1, not 2 vs 2.

### 7.2 Why three cases: where the work is

Slide p15's tree shows where the formula comes from. Level 0 has 1 node doing f(n). Level 1 has a nodes doing f(n/b) each. Level i has **a^i** nodes on inputs of size **n/b^i**. The bottom level has a^(log_b n) = n^(log_b a) leaves doing f(1).

With f(n) = n^d, level i costs a^i · (n/b^i)^d = n^d · (a/b^d)^i. So going down one level multiplies the level total by **a / b^d**:

| Case | Level totals going down | Intuition (slide) | Result |
|---|---|---|---|
| a = b^d | stay the same (n^d each, log_b n + 1 levels) | Work **balanced** across the tree | O(n^d log n) |
| a < b^d | shrink geometrically | Work done at the **root dominates** | O(n^d) |
| a > b^d | grow geometrically | Work done at the **leaves dominates** | O(n^(log_b a)), the number of leaves |

Step through the slide's leaves-dominate example below; type other recurrences in the input bar to see the other two cases:

```viz recursion-tree
{"title": "Slide p16: T(n) = 4T(n/2) + n, drawn for n = 4", "recurrence": "T(n) = 4T(n/2) + n", "n": 4, "interactive": true}
```

### 7.3 Worked examples (slide p16)

| Recurrence | a | b | d | a vs b^d | T(n) |
|---|---|---|---|---|---|
| T(n) = 4T(n/2) + O(n) | 4 | 2 | 1 | 4 > 2 | O(n^(log₂ 4)) = **O(n²)** |
| T(n) = 3T(n/2) + O(n) | 3 | 2 | 1 | 3 > 2 | O(n^(log₂ 3)) ≈ **O(n^1.6)** (log₂ 3 ≈ 1.585) |

And the recurrence from section 6 for comparison: T(n) = 2T(n/2) + n has a = 2, b = 2, d = 1, so 2 = 2¹, which is the balanced case: O(n log n), the same as the recursion tree.

### 7.4 When it does not apply

Slide p14 asks: **can the master theorem solve T(n) = T(n/3) + T(2n/3) + n?** **No.** The two subproblems have different sizes (n/3 and 2n/3), so there is no single b. Use the recursion tree instead. Each full level costs at most n (the sizes on a level add up to at most n). The longest path shrinks by 2/3 each step, so there are about log_{3/2} n levels. Total O(n log n).

> ⚠️ **Pitfall**: the master theorem needs the form a·T(n/b) + n^d with equal-size subproblems. T(n−1) recurrences (like factorial) and uneven splits are not covered. Use the recursion tree (or substitution) for those.

> 📝 **Practice**: [Activity 2](#83-activity-2-master-theorem-slide-17) has eight recurrences to solve with the master theorem.

> ➡️ **Continued in [Lecture 7](lec-07.en-US.md)**: comparison-based sorting, selection sort, insertion sort (slides p18–39 of this deck are repeated there).

---

## 8. In-class Activities (with Solutions)

### 8.1 Activity 0: How many levels and leaves? (slide 11)

For the tree of

```text
T(n) = 2T(n/2) + n
T(1) = c, where c is a constant
```

How many levels and leaves are there?

> ✍️ **Try it first.** Hint: how many times can you halve n before reaching 1?

**Solution.** The input size halves at each level, reaching 1 after log₂ n halvings. So the tree has height log₂ n, which gives **log₂ n + 1 levels** if you count both the root level 0 and the leaf level (slide p12 marks the height as log₂ n). The number of nodes doubles each level, so the leaf level has 2^(log₂ n) = **n leaves**. Each non-leaf level costs n and the leaves cost c·n, so T(n) = n log₂ n + cn = O(n log n). See [section 6](#6-recursion-tree-for-a-divide-in-half-recurrence).

### 8.2 Activity 1: Recursion tree method (slide 13)

**(a)** Determine the Big-O time complexity of binary search using the recursion tree method:

```text
T(n) = T(n/2) + c
T(1) = c
```

**(b)** Determine the Big-O time complexity for the following recurrence using the recursion tree:

```text
T(n) = 2T(n/2) + c
```

(The slide labels both parts "a)".)

> ✍️ **Try it first.**

**Solution (a): O(log n).** Each call makes **one** recursive call on half the range and does constant work c (compute `mid`, one comparison). The "tree" is a chain with one node per level. There are log₂ n + 1 levels, each costing c, so T(n) = c(log₂ n + 1) = **O(log n)**. A recursive binary search with exactly this shape:

```cpp
bool binarySearch(const int* arr, int lo, int hi, int target)
{
    if (lo > hi) return false;           // empty range
    int mid = lo + (hi - lo) / 2;
    if (arr[mid] == target) return true;
    if (target < arr[mid])
        return binarySearch(arr, lo, mid - 1, target);
    return binarySearch(arr, mid + 1, hi, target);
}
```

Searching a 16-element array for a value that isn't there (the worst case) makes 6 calls: ranges of size 16, 8, 4, 2, 1 and then the empty range. That is log₂ 16 + 1 = 5 levels plus the empty-range call this version uses as its base case.

**Solution (b): O(n).** Level i has 2^i nodes, each costing c, so the level totals are c, 2c, 4c, …, n·c (the n leaves). This geometric sum is c(2n − 1) = **O(n)**. The work doubles every level, so the leaves dominate. The two recurrences differ only in "T" vs "2T", and that alone takes the answer from log n to n. Check the sum below (n = 16: 31c = c(2·16 − 1)):

```viz recursion-tree
{"title": "Activity 1(b): T(n) = 2T(n/2) + c, drawn for n = 16", "recurrence": "T(n) = 2T(n/2) + c", "n": 16}
```

### 8.3 Activity 2: Master Theorem (slide 17)

Solve with the master theorem, $T(n) = a \cdot T(n/b) + O(n^d)$:

**(a)** Write the recurrence for binary search and solve it with the master theorem.

**(b)** T(n) = T(n/2) + O(n)

**(c)** T(n) = 2T(n/2) + O(1)

**(d)** T(n) = 2T(n/2) + O(n)

**(e)** T(n) = 4T(n/2) + n

**(f)** T(n) = 4T(n/2) + n²

**(g)** T(n) = 4T(n/2) + n³

**(h)** T(n) = 3T(2n/3) + n

> ✍️ **Try it first.** For each one write a, b, d, then compare a with b^d.

**Solution.**

| | Recurrence | a | b | d | b^d | Case | T(n) |
|---|---|---|---|---|---|---|---|
| (a) | T(n) = T(n/2) + O(1) | 1 | 2 | 0 | 1 | a = b^d | O(n⁰ log n) = **O(log n)** |
| (b) | T(n) = T(n/2) + O(n) | 1 | 2 | 1 | 2 | a < b^d | **O(n)** |
| (c) | T(n) = 2T(n/2) + O(1) | 2 | 2 | 0 | 1 | a > b^d | O(n^(log₂ 2)) = **O(n)** |
| (d) | T(n) = 2T(n/2) + O(n) | 2 | 2 | 1 | 2 | a = b^d | **O(n log n)** |
| (e) | T(n) = 4T(n/2) + n | 4 | 2 | 1 | 2 | a > b^d | O(n^(log₂ 4)) = **O(n²)** |
| (f) | T(n) = 4T(n/2) + n² | 4 | 2 | 2 | 4 | a = b^d | **O(n² log n)** |
| (g) | T(n) = 4T(n/2) + n³ | 4 | 2 | 3 | 8 | a < b^d | **O(n³)** |
| (h) | T(n) = 3T(2n/3) + n | 3 | 3/2 | 1 | 1.5 | a > b^d | O(n^(log_{3/2} 3)) ≈ **O(n^2.71)** |

Key traps:

- (a) and (c) have O(1) extra work, so **d = 0**. (a) matches [Activity 1(a)](#82-activity-1-recursion-tree-method-slide-13).
- (c) and the recursion tree of [Activity 1(b)](#82-activity-1-recursion-tree-method-slide-13) agree: O(n).
- (e)–(g) keep a = 4, b = 2 and change only d, which walks through all three cases: leaves, balanced, root.
- (h): the size shrinks *to* 2n/3, so the shrink factor is b = n ÷ (2n/3) = **3/2**, not 2/3 or 3. Then log_{3/2} 3 = ln 3 / ln 1.5 ≈ 1.0986 / 0.4055 ≈ 2.71.

Back to [section 7](#7-method-b-the-master-theorem).

---

## 9. Quick Reference & Top 5 Things to Remember

**Recipe:** (1) write T(n) = (recursive calls on smaller inputs) + (work outside them), plus a base case; (2) solve it with a recursion tree or the master theorem.

**Master theorem** for T(n) = aT(n/b) + O(n^d):

| Compare | Where the work is | T(n) |
|---|---|---|
| a = b^d | balanced across levels | O(n^d log n) |
| a < b^d | root dominates | O(n^d) |
| a > b^d | leaves dominate | O(n^(log_b a)) |

**Common recurrences from this lecture:**

| Recurrence | Example | T(n) |
|---|---|---|
| T(n) = T(n−1) + c | factorial | O(n) |
| T(n) = T(n/2) + c | binary search | O(log n) |
| T(n) = 2T(n/2) + c | Activity 1(b) | O(n) |
| T(n) = T(n/2) + n | Activity 2(b) | O(n) |
| T(n) = 2T(n/2) + n | slides p10–12 | O(n log n) |
| T(n) = 4T(n/2) + n | slide p16 | O(n²) |
| T(n) = 3T(n/2) + n | slide p16 | O(n^(log₂ 3)) ≈ O(n^1.6) |

**Top 5 things to remember**

1. A recursive function with no loops is **not** automatically O(1): count the calls and the work per call (`factorial` is O(n)).
2. In a recurrence, T(smaller) stands for the recursive calls; the extra term is the work done *outside* them. O(1) extra work means d = 0.
3. Recursion tree: charge each node only its own work, total each level, and sum the levels. 2T(n/2) + n has log₂ n + 1 levels of n each, so O(n log n).
4. Master theorem: read a, b, d and compare a with b^d. Equal gives n^d log n, a smaller gives n^d, a larger gives n^(log_b a).
5. The master theorem needs equal-size subproblems of size n/b. It does not handle T(n−1) or uneven splits like T(n/3) + T(2n/3) + n; draw the tree for those.