# Information and Computer Science 46 — Lecture 2: Smart Pointers, Multi-dimensional Arrays, Empirical Analysis

## Table of Contents

- [1. Smart Pointers: Ownership, Finished](#1-smart-pointers-ownership-finished)
- [2. C++ 1D Arrays (Self Review)](#2-c-1d-arrays-self-review)
- [3. Multidimensional Arrays](#3-multidimensional-arrays)
- [4. Why Analyze Algorithms?](#4-why-analyze-algorithms)
- [5. Empirical Analysis of Running Time](#5-empirical-analysis-of-running-time)
- [6. Mathematical Models of Running Time](#6-mathematical-models-of-running-time)
- [7. In-class Activities (with Solutions)](#7-in-class-activities-with-solutions)
- [8. Quick Reference & Top 5 Things to Remember](#8-quick-reference--top-5-things-to-remember)

> UCI ICS 46 — Prof. Tom Yeh, Fall 2026, 10/1/26. Built from the Lecture 2 slides; Thornton's ICS 46/45C notes and the algs4 booksite §1.4 only as short supplements. Organized by concept, not by source.

> 📅 **Class logistics**:
> Lab 1 due **Mon 10/5**. HW 1 released (no submission required).
> Updated slides with activity solutions are posted at the end of each week.
> Extra credit (1%): consent to AI-activity data use in research, or do the alternate task — details on Ed.
> Today's goals (slide 3): finish smart pointers, multidimensional data, algorithm analysis.

---

## 1. Smart Pointers: Ownership, Finished

Lecture 1 ran out of time before its tree activity, so the smart-pointer review, the activity and its solutions landed here (slides 4–11). For raw pointers, references and `new`/`delete`, see the [Lecture 1 notes](lec-01.en-US.md).

### 1.1 Smart pointer review

Smart pointers (`#include <memory>`) delete their object for you when the pointer itself dies. Slide 5 lists three (the slide spells one "`std::share_ptr`"; the real name is `std::shared_ptr`):

| Pointer | Ownership | Object destroyed when… | Copyable? |
|---|---|---|---|
| `std::unique_ptr` | 1-to-1 | that pointer is destroyed | no — transfer with `std::move` |
| `std::shared_ptr` | many-to-1 (reference count) | the **last** owning pointer is destroyed | yes (count +1) |
| `std::weak_ptr` | none — "loaning" | never: no cleanup when it dies | yes |

`weak_ptr` is for function parameters and **cyclic data structures**. **`.get()`** extracts the raw address from a smart pointer.

```cpp
std::unique_ptr<int> p(new int);
*p = 3;                  // * and -> work like a raw pointer
// std::unique_ptr<int> q = p;          // error: copy is deleted
std::unique_ptr<int> q = std::move(p);  // OK: q owns it, p is now nullptr
```

> ⚠️ **Pitfall**: `shared_ptr` is not garbage collection — a **cycle** of `shared_ptr`s (parent owns child, child owns parent) never reaches count 0 and leaks. That's the trap in the tree activity below.

### 1.2 Raw and smart pointers together

Slide 11's rule of thumb:

- **Owners** — smart pointers control the resource's lifespan.
- **Observers** — raw pointers may look at (read, write, inspect) an object **without responsibility for destroying it**.
- **`.get()`** passes out a temporary, non-owning raw pointer **without giving up ownership**.

```cpp
root->left->parent = root.get();   // parent observes root; root still owns it
```

| Working design for a tree with parent links | When to use |
|---|---|
| `shared_ptr` down + `weak_ptr` up | shared or unpredictable lifetimes, breaking cycles; the observer can check if the object is gone (`lock()`, `expired()`) |
| `unique_ptr` down + raw `Node*` up (via `.get()`) | faster (no counting); safe **only if the owner outlives the observer** — true in a tree, since a parent's destructor destroys its children |

> 📘 **Beyond the lecture**: Thornton's rule for "loan this object to a function": prefer a reference (`const Node&`) since it can't be null; use a raw pointer if `nullptr` is a legal argument, and `weak_ptr` only if the borrower might outlive the owner.

### 1.3 The tree activity: four designs

The activity (slide 6) starts from a raw-pointer `Node` with `left`, `right`, `parent`, three `new Node()`s linked parent↔child, and three manual `delete`s (the slide's comment: "Manual cleanup is fragile. Deleting out-of-order causes crash"). The four designs, all compiled with `g++ -std=c++17 -Wall -fsanitize=address,undefined`:

| Design (slide) | `left` / `right` | `parent` | Compiles? | Result |
|---|---|---|---|---|
| Raw (p6) | `Node*` | `Node*` | yes | correct only if every `delete` is written by hand; after `delete root` three pointers dangle |
| (a)/(b) naive (p7–8) | `unique_ptr` | `unique_ptr` | **no** | `root->left = leftChild;` copies a `unique_ptr` → "use of deleted function … `operator=`" |
| (c) (p9) | `shared_ptr` | `weak_ptr` | yes | all 3 destructors run, no leak |
| (c′) all shared (counter-example) | `shared_ptr` | `shared_ptr` | yes | **leaks**: no destructor runs (ASan: 216 bytes in 6 allocations) |
| (d) (p10) | `unique_ptr` | raw `Node*` | yes | all 3 destructors run, no leak, no counting |

Slide 10's version (d):

```cpp
class Node {
public:
    Node() { std::cout << "Node created\n"; }
    ~Node() { std::cout << "Node destroyed\n"; }

    // Downward links hold exclusive ownership
    std::unique_ptr<Node> left;
    std::unique_ptr<Node> right;

    // Upward link is a non-owning observer
    Node* parent = nullptr;
};

int main() {
    {
        // 1. Initialize nodes as unique pointers
        std::unique_ptr<Node> root(new Node());
        std::unique_ptr<Node> leftChild(new Node());
        std::unique_ptr<Node> rightChild(new Node());

        // 2. Transfer ownership downward using std::move
        root->left = std::move(leftChild);
        root->right = std::move(rightChild);

        // 3. Set upward back-pointers using the raw address (.get())
        root->left->parent = root.get();
        root->right->parent = root.get();
    } // <-- All 3 nodes are completely destroyed here automatically!

    std::cout << "End of main.\n";
    return 0;
}
```

Design (d) in memory: owning `unique_ptr`s point down, raw `parent` pointers point up, and the moved-from locals are `nullptr`. Step through it below (← / → keys work when the demo is focused):

```viz memory-trace
{"title": "Design (d): unique_ptr down, raw pointer up (slide 10)", "steps": [{"code": "root->left = std::move(leftChild); ... root->left->parent = root.get(); ...", "note": "each Node has exactly one owner; the moved-from locals are nullptr; parent links only observe", "stack": [{"frame": "main", "vars": [{"name": "root (unique_ptr)", "value": "->n0"}, {"name": "leftChild (unique_ptr)", "value": "nullptr", "old_target": "n1"}, {"name": "rightChild (unique_ptr)", "value": "nullptr", "old_target": "n2"}]}], "heap": [{"id": "n0", "type": "Node (root)", "fields": [{"name": "left (unique_ptr)", "value": "->n1"}, {"name": "right (unique_ptr)", "value": "->n2"}, {"name": "parent (Node*)", "value": "nullptr"}]}, {"id": "n1", "type": "Node (left child)", "fields": [{"name": "left (unique_ptr)", "value": "nullptr"}, {"name": "right (unique_ptr)", "value": "nullptr"}, {"name": "parent (Node*)", "value": "->n0"}]}, {"id": "n2", "type": "Node (right child)", "fields": [{"name": "left (unique_ptr)", "value": "nullptr"}, {"name": "right (unique_ptr)", "value": "nullptr"}, {"name": "parent (Node*)", "value": "->n0"}]}]}, {"code": "}   // end of block", "note": "root dies -> deletes n0 -> n0's left/right die -> delete n1 and n2. No leak, no double delete", "free": ["n0", "n1", "n2"], "set": {"main.root (unique_ptr)": {"value": "nullptr", "old_target": "n0"}}}]}
```

Output (with one extra line after step 2 printing whether `leftChild` is null):

```text
Node created
Node created
Node created
leftChild is now nullptr
Node destroyed
Node destroyed
Node destroyed
End of main.
```

> ⚠️ **Pitfall**: After `std::move(leftChild)`, `leftChild` is `nullptr` — that's why slide 10 writes `root->left->parent`, not `leftChild->parent` (which slide 9's `shared_ptr` version can still use).

> 📝 **Practice**: [Previous Lecture's Activity (a)–(d)](#71-previous-lectures-activity-ad-slides-610)

---

## 2. C++ 1D Arrays (Self Review)

Slide 12 marks this as self review (ICS 45C material).

### 2.1 Statically vs dynamically allocated

An array is contiguous cells of one type, indexed from 0, with a fixed size you must track yourself (slide 13):

| | Statically allocated | Dynamically allocated |
|---|---|---|
| Syntax | `int a[10];` | `int* a = new int[size];` |
| Size known | at compile time | at run time |
| Lives on | run-time stack | heap; `new` returns a pointer to the first element |
| Cleanup | automatic | `delete[] a;` |

The slide's `void foo(unsigned int n) { int a[n]; }` is a **variable-length array**: some compilers accept it, but it's **not standard C++** (g++ `-pedantic`: `warning: ISO C++ forbids variable length array 'a' [-Wvla]`), and a large `n` can overflow the stack.

### 2.2 Passing arrays and pointer arithmetic

Slide 14: an array can be passed as a parameter **regardless of allocation method** — you pass a **pointer to the first element** plus the **size** for manual bounds checking.

```cpp
void zeroArray(int* a, unsigned int size)
{
    for (unsigned int i = 0; i < size; ++i)
    {
        a[i] = 0;
    }
}
```

```cpp
int x[10];
zeroFill(x, 50);

int* x = new int[10];
zeroFill(x, 50);
```

Both calls compile without a warning and write 40 ints past the end; the size is just a number C++ trusts. ASan catches the dynamic one: `heap-buffer-overflow … 0 bytes after 40-byte region … in zeroFill(int*, unsigned int)`.

> ⚠️ **Slide note (p14)**: the function is named `zeroArray` in the definition but called as `zeroFill` — same function, pick one name.

Pointer arithmetic (slide 14):

- `p + k` adds `k * sizeof(type)` bytes to the address.
- `(a + 1)` is the address of `a[1]`; `(a - 1)` is "`a[-1]`" — allowed by the compiler, but **undefined**.
- `(a - b)` = difference between `a[0]` and `b[0]`, divided by the size of the type.

> ⚠️ **Slide note (p14)**: the slide writes `(a + 1) == a[1]`, missing a `*` → `*(a + 1) == a[1]` (or `a + 1 == &a[1]`).

```cpp
int a[10];
int b[10];
std::cout << a << std::endl;
std::cout << (a + 1) << std::endl;
*(a + 1) = 3;
std::cout << (a - 1) << std::endl;
std::cout << (a - b) << std::endl;
```

Verified: `sizeof(int) = 4`, `(char*)(a + 1) - (char*)a = 4 bytes`, after `*(a + 1) = 3` → `a[1] = 3`, and `&a[7] - a = 7 elements`.

Slide 18 summarizes `int x[10];` (`x` decays to an `int*` to `&x[0]`):

| View | Formula |
|---|---|
| Pointer address | `&x[i] == x + i` (scaled by type size automatically) |
| Byte address | `Base + (i × sizeof(int))` |
| Value | `x[i] == *(x + i)` |

One multiply and one add, so **every index costs the same constant time**.

### 2.3 `std::vector`

Slide 15: `std::vector` is a dynamic 1D array **managed with RAII** (it frees its array in its destructor, so it can't leak), and **`at()`** is `[ ]` **plus a range check**.

```cpp
std::vector<int> v;
for (unsigned int i = 0; i < 10; i++)
{
    v.push_back(i);
}
for (unsigned int i = 0; i < 10; i++)
{
    v.at(i) += 10;
    std::cout << v.at(i) << std::endl;
}
```

Output (shown on one line), plus an extra `v.at(10) = 1;`:

```text
10 11 12 13 14 15 16 17 18 19
v.at(10) threw std::out_of_range
```

`v[10] = 1` would be silent undefined behaviour. Review link on the slide: Thornton's [ICS 45C Single-Dimension Arrays](http://www.ics.uci.edu/~thornton/ics45c/Notes/SingleDimensionArrays).

---

## 3. Multidimensional Arrays

### 3.1 Declaring and storing an nd array

Slide 17: declare a **fixed, compile-time size for each dimension**; what each dimension *means* (rows vs columns) is up to you. In memory the array is **flattened into one row**, in **row-major order**: the rightmost index varies fastest, so elements with the same first index are contiguous.

```cpp
int a[4][5];

for (int i = 0; i < 4; ++i)
{
    for (int j = 0; j < 5; ++j)
    {
        a[i][j] = i * j;
    }
}
```

Layout of `int a[4][5]` (slides 17/19): every element in memory order, then where `a[2][3]` lands. Step through it below (← / → keys work when the demo is focused):

```viz array-2d
{"title": "int a[4][5] in row-major order", "dims": [4, 5], "find": [2, 3]}
```

Reading the block straight through as `int*` prints slide 17's value row:

```text
flat: 0 0 0 0 0 0 1 2 3 4 0 2 4 6 8 0 3 6 9 12
```

### 3.2 Indexing: the address formula

Slide 19, `int a[4][5];` — `a` decays to a pointer to a whole row (`int(*)[5]`), so `a + i` skips `i` rows of 5 ints:

| View | Formula |
|---|---|
| Element address | `&a[i][j] == *(a + i) + j == (int*)a + (i × 5 + j)` |
| Byte address | `Base + (i × 5 + j) × sizeof(int)` |
| Element value | `a[i][j] == *(*(a + i) + j) == *((int*)a + (i × 5 + j))` |

Worked case, `i = 2, j = 3` (real output):

```text
a[2][3] = 6, *(*(a + i) + j) = 6, *((int*)a + (i * 5 + j)) = 6
byte offset of a[2][3] = 52 = (2*5+3)*4
sizeof(a) = 80, sizeof(a[0]) = 20, (char*)(a + 1) - (char*)a = 20
```

**N-dimensional rule** (slide 19): the address calculation needs the sizes of **all inner dimensions** — everything except the leftmost. The 5 appears in `i × 5 + j`; the 4 never does.

> 📘 **Beyond the lecture**: That rule is why a 2D array parameter must carry its inner size in the type — `void fill(int a[][5], int rows)` compiles, `void fill(int* a, int rows, int cols)` with `a[i][j]` does not (Thornton, *Multidimensional Data*).

> 📝 **Practice**: [Activity 1](#72-activity-1-slide-20) — layout and formula for `int a[3][2][4]`.

---

## 4. Why Analyze Algorithms?

Slide 22: you are often three people at once — the **programmer** (needs a working solution), the **client** (wants an efficient one) and the **theoretician** (wants to understand). Slide 23's reasons to analyze efficiency: **predict** performance, **compare** algorithms, **provide** guarantees, **understand** the theory, and **avoid** performance bugs.

**Computational complexity** = **time complexity** (how running time grows with input size) + **space complexity** (how memory grows). This lecture covers time, two ways: measure it (§5) and model it (§6).

---

## 5. Empirical Analysis of Running Time

### 5.1 The running example: 3-SUM

Slide 24: given n distinct numbers, how many **unordered triplets** sum to 0? Input `30 -40 -20 -10 40 0 10 5` → **4** (`30 -40 10`, `30 -20 -10`, `-40 40 0`, `-10 0 10`).

```cpp
int count = 0;
for (int i = 0; i < n; i++) {
    for (int j = i+1; j < n; j++) {
        for (int k = j+1; k < n; k++) {
            if (a[i] + a[j] + a[k] == 0) {
                count++;
            }
        }
    }
}
```

Slide 25 times it on files of random ints:

| File | n | Triples | Time (s) |
|---|---|---|---|
| 8ints.txt | 8 | 4 | 0 |
| 1Kints.txt | 1000 | 70 | 0.081 |
| 2Kints.txt | 2000 | 528 | 0.38 (rerun: 0.371) |
| 4Kints.txt | 4000 | 4039 | 2.792 |
| 8Kints.txt | 8000 | 32074 | 21.623 |
| 16Kints.txt | 16000 | 255181 | 177.344 |

Same input, different times (0.38 vs 0.371): measurements are noisy.

> 📘 **Beyond the lecture**: algs4 frames this as the scientific method — observe, hypothesize a model, predict an unmeasured case, verify, repeat. The doubling test below is exactly that loop.

### 5.2 Log-log plots and power laws

Slide 26: plot T(n) vs n, then re-plot on a **log-log** chart. If it's a straight line, the running time is a **power law**:

$$T(n) = a\,n^b \quad\Longrightarrow\quad \log T(n) = b \log n + \log a$$

The slope is **b**. The slide 25/27 measurements for 3-SUM, added one at a time on a log-log plot with the doubling ratios (step through it below (← / → keys work when the demo is focused)):

```viz doubling-test
{"title": "3-SUM doubling test (slides 25, 27)", "n": [1000, 2000, 4000, 8000, 16000], "times": [0.081, 0.38, 2.792, 21.623, 177.344]}
```

From lg n = 11.97 to 13.97 the line rises 7.47 − 1.48 ≈ 6.0 over 2.0: slope **b = 3**. The slide's fit: **T(n) ≈ 0.42 × 10⁻¹⁰ n³** s.

### 5.3 The doubling hypothesis

Slide 27: double n and take the ratio — a cancels:

$$\frac{T(n)}{T(n/2)} = \frac{a\,n^b}{a\,(n/2)^b} = 2^b$$

- **b**: for 8000 → 16000 the ratio is 177.344 / 21.623 ≈ **8.2**, so b ≈ lg 8.2 ≈ **3**.
- **a**: T(16000) = 177.34 = a × 16000³ → a = 0.42 × 10⁻¹⁰.

> ⚠️ **Slide note (p27)**: 177.34 / 16000³ actually computes to **0.43 × 10⁻¹⁰**; the slide's 0.42 comes from the fitted line.

All ratios from the p27 table:

| n | T(n) (s) | T(n)/T(n/2) | lg ratio |
|---|---|---|---|
| 8 | 0 | — | — |
| 1000 | 0.081 | — | — |
| 2000 | 0.38 | 4.7 | 2.2 |
| 4000 | 2.792 | 7.3 | 2.9 |
| 8000 | 21.623 | 7.7 | 2.95 |
| 16000 | 177.344 | 8.2 | 3.04 |

**Why pick the 2 larger input sizes?** (slide 27's question) At small n the times are tiny, so timer resolution and noise are a big fraction (n = 8 even reads 0), and lower-order terms and fixed overheads aren't yet negligible next to n³. The ratio only settles near 8 for large n.

Reproduced on my machine (`-O2`, min of 3 runs, random ints): ratios 7.97, 7.60, 8.25, 7.81 from n = 500 to 8000 — **b ≈ 3** again, but a ≈ 1.7 × 10⁻¹⁰ (86.949 s at n = 8000), a different constant on different hardware.

> 📝 **Practice**: [Activity 2](#73-activity-2-slide-28) — pick the model T(n) from a table of timings.

### 5.4 What determines a and b

Slide 29, for T(n) = a·n^b:

| | System-independent factors | System-dependent factors |
|---|---|---|
| Determine | the exponent **b** (and affect a) | only the constant **a** |
| Examples | data structures + algorithm for the operations; the algorithm; the input data | hardware (CPU, memory, cache); software (compiler, garbage collector); system (OS, network, etc.) |

So b is a property of the algorithm and its input; a faster machine changes a, never b.

---

## 6. Mathematical Models of Running Time

### 6.1 Total time = Σ cost × frequency

Slide 31 (Donald Knuth, 1960s): **total running time = sum of cost × frequency over all operations.**

| Cost | Frequency |
|---|---|
| system & machine dependent | algorithm & data dependent |
| exact cost depends on machine and compiler; analyze the program to find its basic operations | depends on data structures, algorithm design and input; accurate mathematical models are available in principle |

Slide 32, relative cost of basic C++ operations: `int add < int multiply < int divide < float add < float multiply < float divide`; memory access varies, but basic models assume it costs about an add.

| Operation | Example | Cost |
|---|---|---|
| Variable declaration | `int a;` | c1 |
| Assignment | `a = b;` | c2 |
| Integer comparison | `a < b;` | c3 |
| Array / vector access | `a[i]`, `v[i]` | c4 |
| Container size | `v.size()` | c5 |
| Dynamic allocation | `new int[n]`, `std::vector<int> v(n)` | c6·n |

Allocation is the odd one: proportional to n, not constant. (The slide's column header shows a raw `$c_i$` — a LaTeX rendering slip.)

### 6.2 Counting operations: 1-Sum

Slide 33: given n distinct numbers, how many single numbers equal 0?

```cpp
int count = 0;
for (int i = 0; i < n; i++) {
    if (a[i] == 0) {
        count++;
    }
}
```

| Operation | Frequency | Why |
|---|---|---|
| Variable declaration | 2 | `count`, `i` |
| Assignment | 2 | `count = 0`, `i = 0` |
| Less than | **n + 1** | `i < n` is true n times, then false once to exit |
| Equal to | n | `a[i] == 0` |
| Array access | n | `a[i]` |
| Increment | **n to 2n** | `i++` n times, plus 0..n `count++` depending on data |

Instrumented at n = 10: `less=11 equal=10 access=10`; `incr=10` with no zero, `incr=11` with one zero.

> ⚠️ **Slide note (p33)**: with **distinct** numbers at most one can be 0, so the increment count is really **n to n + 1** (n to 2n is the bound without "distinct").

### 6.3 Tilde notation

Slide 35: estimate running time (or memory) by keeping only the **leading term** — for large n the lower-order terms are negligible.

| Expression | Tilde |
|---|---|
| (1/6)n³ + 10n + 100 | ~ n³ |
| (1/6)n³ + 100n² + 47 | ~ n³ |
| (1/6)n³ + 100n^(2/3) + (1/2)/n | ~ n³ |

> 📘 **Beyond the lecture**: algs4 defines g(n) ~ f(n) as g(n)/f(n) → 1, which keeps the coefficient: the first row is strictly ~ (1/6)n³. The slide's "~ n³" is shorthand for the order of growth. Big-O comes in Lecture 3.

### 6.4 Simplification: cost model + tilde

Slide 36: (1) **cost model** — use one basic operation as a proxy for running time, e.g. **array accesses**; (2) describe its frequency with tilde notation. Applied to 2-Sum:

| Operation | Frequency | Tilde |
|---|---|---|
| Variable declaration | n + 2 | ~ n |
| Assignment | n + 2 | ~ n |
| Less than | (n + 1)(n + 2)/2 | ~ n² |
| Equal to | n(n − 1)/2 | ~ n² |
| Array access | n(n − 1) | ~ n² |
| Increment | n(n + 1)/2 to n² | ~ n² |

Result: **~n² array accesses for the 2-SUM problem.** Same reasoning for 3-SUM: C(n, 3) ~ n³/6 triples × 3 accesses = **~n³/2 array accesses**, matching the b = 3 the experiment found.

> ➡️ **Continued in [Lecture 3](lec-03.en-US.md)**: Activity 3 (2-Sum operation counts, slide 34) is worked and solved at the start of Lecture 3, followed by growth rates and Big-O/Ω/Θ.

---

## 7. In-class Activities (with Solutions)

### 7.1 Previous Lecture's Activity a–d (slides 6–10)

Starting code (slide 6):

```cpp
#include <iostream>

class Node {
public:
    Node() { std::cout << "Node created\n"; }
    ~Node() { std::cout << "Node destroyed\n"; }

    // Member pointers initialized safely to nullptr
    Node* left = nullptr;
    Node* right = nullptr;
    Node* parent = nullptr;
};

int main() {
    {
        std::cout << "--- Initializing Tree Elements ---\n";
        Node* root = new Node();
        Node* leftChild = new Node();
        Node* rightChild = new Node();

        // Linking parent-to-child and child-to-parent
        root->left = leftChild;
        root->right = rightChild;

        root->left->parent = root;
        root->right->parent = root; // Complete relationship mapping

        std::cout << "--- Tearing Down Tree Elements ---\n";
        // ⚠ Manual cleanup is fragile. Deleting out-of-order causes cras[h]
        delete root;
        delete leftChild;
        delete rightChild;
    }

    std::cout << "End of main.\n";
    return 0;
}
```


**(a)** Convert raw pointers to unique pointers.
**(b)** What happens when you try to compile? Why?
**(c)** Fix any necessary smart pointer types to ensure no memory leaks.
**(d)** Convert to using only `unique_ptr` and raw ptrs for performance.

**Solution.**

**(a)** Make every `Node*` (members and locals) a `std::unique_ptr<Node>` and drop the `delete`s.

**(b)** Compile error: `root->left = leftChild;`, `root->right = rightChild;` and `root->left->parent = root;` each **copy** a `unique_ptr`, and its copy assignment is deleted (two unique owners would delete the same Node twice). The parent link is also a design error — a child can't own its parent.

**(c)** Ownership down, observation up: `left`/`right` (and locals) become `std::shared_ptr<Node>`, `parent` becomes `std::weak_ptr<Node>`. The `weak_ptr` doesn't count, so root's count drops to 0 at the end of the block and all three Nodes are destroyed. With `parent` as `shared_ptr` too, the cycle leaks all three.

**(d)** `unique_ptr` down, raw pointer up:

```cpp
root->left = std::move(leftChild);
root->right = std::move(rightChild);
root->left->parent = root.get();
root->right->parent = root.get();
```

Faster (no reference counts) and safe because the parent always outlives its children.

### 7.2 Activity 1 (slide 20)

`int a[3][2][4];`
**(a)** Draw the 1D continuous memory layout of this 3d array.
**(b)** What is the pointer arithmetic formula for accessing `a[i][j][k]`?

**Solution.**

**(a)** 24 ints in one block; `k` varies fastest, then `j`, then `i`. Each `a[i]` is 8 ints, each `a[i][j]` is 4:

| Flat positions | 0–3 | 4–7 | 8–11 | 12–15 | 16–19 | 20–23 |
|---|---|---|---|---|---|---|
| Elements | `a[0][0][0..3]` | `a[0][1][0..3]` | `a[1][0][0..3]` | `a[1][1][0..3]` | `a[2][0][0..3]` | `a[2][1][0..3]` |

**(b)** `&a[i][j][k] == (int*)a + (i * 2 * 4 + j * 4 + k)`, so `a[i][j][k] == *((int*)a + (i * 8 + j * 4 + k))` (also `*(*(*(a + i) + j) + k)`); byte address `Base + (i × 8 + j × 4 + k) × sizeof(int)`. Only the inner sizes 2 and 4 appear. Checked for all 24 cells: `correct for all 24 cells? 1`.

### 7.3 Activity 2 (slide 28)

Suppose you time your code and make the following observations. Which function is the closest model of T(n)? Show your work.

A. n²  B. 6 × 10⁻⁴ n  C. 5 × 10⁻⁹ n²  D. 7 × 10⁻⁹ n²

| Input size | 1000 | 2000 | 4000 | 8000 | 16000 | 32000 |
|---|---|---|---|---|---|---|
| Time | 0 | 0.0 | 0.1 | 0.3 | 1.3 | 5.1 |

**Solution: C.**

1. b from the two largest sizes: 5.1 / 1.3 ≈ 3.9 ≈ 2² → **b ≈ 2**. Rules out B (linear).
2. a from n = 32000: a = 5.1 / 32000² = 5.1 / (1.024 × 10⁹) ≈ **5 × 10⁻⁹**.
3. Check: A predicts ~10⁹ s; D predicts 7.2 s at 32000. C predicts 5.1 s and 1.28 s at 16000. ✓

Ignore the small sizes: 0.3 / 0.1 = 3 is mostly rounding.

---

## 8. Quick Reference & Top 5 Things to Remember

| Topic | Key fact |
|---|---|
| `unique_ptr` | one owner, no copy; `std::move` transfers, source becomes `nullptr` |
| `shared_ptr` | reference count; object dies with the last owner; cycles leak |
| `weak_ptr` | non-owning; breaks cycles; `lock()` / `expired()` |
| raw `T*` via `.get()` | observer; owner must outlive it |
| 1D address | `&x[i] == x + i`, `x[i] == *(x + i)`, byte `Base + i × sizeof(T)` |
| 2D `T a[R][C]` | row-major; `a[i][j] == *((T*)a + (i × C + j))` |
| 3D `T a[D0][D1][D2]` | `*((T*)a + (i × D1 × D2 + j × D2 + k))` |
| Power law | T(n) = a·n^b; slope b on a log-log plot |
| Doubling | T(n)/T(n/2) = 2^b; b = lg(ratio), then a = T(n)/n^b |
| Math model | T = Σ cost × frequency; tilde keeps the leading term |
| 1-Sum / 2-Sum / 3-Sum | ~n / ~n² / ~n³/2 array accesses |

**Top 5 things to remember**

1. Copying a `unique_ptr` is a compile error; use `std::move`, after which the source is `nullptr`.
2. Parent ↔ child both `shared_ptr` leaks; make the back-pointer `weak_ptr`, or use `unique_ptr` down + raw `.get()` up.
3. C++ arrays are row-major, and an nd address needs every dimension size except the first.
4. Doubling n multiplies time by 2^b; compute b and a from the largest inputs.
5. A `for` loop's test runs n + 1 times, and tilde notation keeps only the leading term (2-Sum: ~n² array accesses).