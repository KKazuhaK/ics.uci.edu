# Information and Computer Science 46 — Lecture 3: Algorithm Analysis + ArrayList

## Table of Contents

- [1. The 2-Sum Problem: Counting Operations](#1-the-2-sum-problem-counting-operations)
- [2. Asymptotic Analysis: Big-O, Big-Ω, Big-Θ](#2-asymptotic-analysis-big-o-big-ω-big-θ)
- [3. Common Orders of Growth](#3-common-orders-of-growth)
- [4. Space Complexity](#4-space-complexity)
- [5. Why Data Structures?](#5-why-data-structures)
- [6. ArrayList (Dynamic Array)](#6-arraylist-dynamic-array)
- [7. Resizing and Amortized Analysis](#7-resizing-and-amortized-analysis)
- [8. Complete Implementation](#8-complete-implementation)
- [9. In-class Activities (with Solutions)](#9-in-class-activities-with-solutions)
- [10. Quick Reference & Top 5 Things to Remember](#10-quick-reference--top-5-things-to-remember)

> UCI ICS 46 — Prof. Tom Yeh, Fall 2026, 10/6/26. Built from the Lecture 3 slides (plus the 2-Sum prompt from Lecture 2, slide 34); Thornton's *Asymptotic Analysis* / *Amortized Analysis* notes and algs4 §1.4 as supplements. Organized by concept, not by source.

> 📅 **Class logistics** (slide 2):
> HW 1 & 2 released; **HW 2 due Fri 10/16**. **Lab 2** releases by 10/7, **due Mon 10/19** — use TA office hours.
> **Learning Activities Fri 10/9 & Fri 10/16** count (combined) for Quiz 1; no prep needed, generously curved.
> Metacog research consent form (consent or not): **1% extra credit** (alternative offered); data anonymized, not used for academic integrity.

Today's goals (slide 3): finish algorithm analysis (mathematical model → Big-O/Ω/Θ), then the first data structure, the **ArrayList**.

---

## 1. The 2-Sum Problem: Counting Operations

> ⬅️ **Received from Lecture 2**: the 2-Sum activity was posed at the end of [Lecture 2](?kind=course_notes&course=ICS-46&lang=en-US&note=ICS46_Lec02_Notes_en-US.md) (slide 34, along with the mathematical model and tilde notation); its solution is slide 4 here.

**Problem:** given n distinct numbers, how many *unordered* pairs ("duplets") sum to 0? Brute force tries each pair `i < j` once:

```cpp
int count = 0;
for (int i = 0; i < n; i++) {
    for (int j = i+1; j < n; j++) {
        if (a[i] + a[j] == 0) {
            count++;
        }
    }
}
```

For a fixed `i` the inner body runs `n - i - 1` times, so in total $(n-1) + \dots + 1 + 0 = n(n-1)/2$ times (one per pair). Each loop *test* runs once more than its body. Slide 4's count:

| Operation | Frequency (slide 4) | Where it comes from |
|---|---|---|
| Variable declaration | $n + 2$ | `count`, `i`, and `j` once per outer iteration |
| Assignment | $n + 2$ | `count = 0`, `i = 0`, `j = i+1` ×n |
| Less than | $(n+1)(n+2)/2$ | outer: $n+1$; inner: $n + (n-1) + \dots + 1 = n(n+1)/2$ |
| Equal to | $n(n-1)/2$ | once per inner body |
| Array access | $n(n-1)$ | `a[i]`, `a[j]`: 2 per inner body |
| Increment | $n(n+1)/2$ to $n^2$ | `i++` ×n + `j++` ×n(n−1)/2, plus 0 or more `count++` |

The slide's verdict: **"Already becoming too tedious to calculate!"** — so pick one cost model (array accesses) and keep only the leading term: brute-force 2-Sum makes **$\sim n^2$** array accesses. The rest of the lecture drops the constant too.

Instrumented run (every row matches):

```text
n=10 (no pairs)  pairs=0 decl=12 assign=12 less=66 eq=45 access=90 incr=55
   formulas: n+2=12 (n+1)(n+2)/2=66 n(n-1)/2=45 n(n-1)=90 n(n+1)/2=55 n^2=100
```

> ⚠️ **Pitfall**: the loop test runs **one more time than the body** (the final, failing test) — outer `<` is $n+1$, not $n$.

> 📝 **Practice**: [Activity 3: 2-Sum](#91-activity-3-2-sum-lec-02-slide-34-solution-slide-4)

---

## 2. Asymptotic Analysis: Big-O, Big-Ω, Big-Θ

### 2.1 Why "think big" (slides 5–7)

Slide 6 compares $f(n) = n$, $g(n) = 4n$, $h(n) = n^2$. For small n, $f$ and $g$ look very different and $h$ is even *below* them ($n^2 < 4n$ for $n < 4$). For large n, $f$ and $g$ look alike next to $h$, which grows at a distinctly different rate.

**Asymptotic analysis** (slide 7) describes running time as a function of input size n and looks only at its growth as n gets large: **ignore small n ("THINK BIG")**; **slower growth rate = better algorithm**.

| n | $f = n$ | $g = 4n$ | $h = n^2$ |
|---|---|---|---|
| 2 | 2 | 8 | 4 |
| 4 | 4 | 16 | 16 |
| 100 | 100 | 400 | 10,000 |

### 2.2 Big-O: upper bound (slides 8–10)

$f(n)$ is $O(g(n))$ if there exist positive constants $c$ and $n_0$ with

$$f(n) \le c \cdot g(n) \quad \text{for all } n \ge n_0.$$

$f$ is the actual running time, $g$ a simpler function of the same shape; $c$ absorbs constant factors, $n_0$ ignores small n. Informally: "my code takes **at most** this long." Slide 9's examples: $3n^3 + 2n + 7 = O(n^3)$; $2^n + n^2 = O(2^n)$; $1000 = O(1)$; and $3n^3 + 2n + 7 = O(n^6)$ is true **but a useless bound** — give the tightest one. Big-O (slide 10) enables high-level comparison as n grows and ignores lower-level details: it is **not** the exact runtime.

**Worked $c$, $n_0$:** for $n \ge 1$, $2n \le 2n^3$ and $7 \le 7n^3$, so $3n^3 + 2n + 7 \le 12n^3$. Hence $c = 12$, $n_0 = 1$ works and $3n^3 + 2n + 7 = O(n^3)$. Shortcut: **keep the fastest-growing term, drop its coefficient.**

> 📝 **Practice**: [Slide 8 question](#92-slide-questions-reading-bounds-off-a-graph-slides-8-11-12) — which of n, 4n, n² bounds the curve? Answer: only n².

### 2.3 Big-Ω: lower bound (slide 11)

$f(n)$ is $\Omega(g(n))$ if there exist positive $c$, $n_0$ with $f(n) \ge c \cdot g(n)$ for all $n \ge n_0$ — "**at least** this long." Ω can describe whole classes of algorithms: every comparison-based sort is $\Omega(n \log n)$.

Slide 11's plots: $f_1(n)$ sits mostly at small values with occasional spikes up to about n → $\Omega(1)$; $f_2(n)$ is a straight line ≈ n → $\Omega(n)$.

> 📘 **Beyond the lecture**: $f_1$'s spikes fall on the primes and its low values look like each n's smallest divisor — the step count of trial-division primality testing: cheap for most n, linear for primes.

### 2.4 Big-Θ: tight bound (slides 12–13)

$f(n)$ is $\Theta(g(n))$ if it is both $O(g(n))$ and $\Omega(g(n))$ — "exactly this long, up to constants and lower-order terms." **If Big-O and Big-Ω differ, Big-Θ is undefined.** So $f_2(n) = \Theta(n)$, while $f_1$ ($O(n)$, $\Omega(1)$) has no Θ.

| Notation | Bound | Definition (∃ $c, n_0 > 0$, ∀ $n \ge n_0$) | Plain English |
|---|---|---|---|
| $O(g)$ | upper | $f(n) \le c \cdot g(n)$ | at most |
| $\Omega(g)$ | lower | $f(n) \ge c \cdot g(n)$ | at least |
| $\Theta(g)$ | tight | both | "exactly", up to constants |

The same notations describe time **and** space.

> 📝 **Practice**: [Activity 1](#93-activity-1-big-o-big-omega-big-theta-slide-14), [slide 11/12 questions](#92-slide-questions-reading-bounds-off-a-graph-slides-8-11-12)

### 2.5 Case vs. growth rate (slide 15)

Two separate questions: **which case?** (best / average / worst input) and **how does it grow?** (O(1), O(log n), O(n), O(n²), …). Linear search in an array of n:

| Case | When | Comparisons | Growth |
|---|---|---|---|
| Best | target is first | 1 | O(1) |
| Average | target in the middle | n/2 | O(n) |
| Worst | target last or absent | n | O(n) |

> ⚠️ **Pitfall**: "Big-O = worst case, Big-Ω = best case" is **wrong**. Fix a case first, then bound it: linear search is worst case Θ(n) and best case Θ(1). With no case named, it is O(n) and Ω(1) but has no Θ.

---

## 3. Common Orders of Growth

Slide 16: a handful of functions cover almost every algorithm (chart from bigocheatsheet.com — green for O(1)/O(log n), yellow O(n), orange O(n log n), red O(n²), O(2ⁿ), O(n!)).

| Order | Name | Typical shape | Example | n = 1,000 |
|---|---|---|---|---|
| $1$ | constant | fixed statements | `a[i]` | 1 |
| $\log n$ | logarithmic | halve the range each step | binary search | ≈10 |
| $n$ | linear | one loop | linear search | 1,000 |
| $n \log n$ | linearithmic | divide in half + linear work | mergesort | ≈10⁴ |
| $n^2$ | quadratic | two nested loops | 2-Sum | 10⁶ |
| $n^3$ | cubic | three nested loops | 3-Sum | 10⁹ |
| $2^n$ | exponential | every subset | subset sum | ≈10³⁰¹ |
| $n!$ | factorial | every ordering | brute-force TSP | astronomically large |

---

## 4. Space Complexity

Slide 17: a **bit** is 0/1, a **byte** is 8 bits. Traditional KB/MB/GB/TB = $2^{10}/2^{20}/2^{30}/2^{40}$ bytes (1,024, not 1,000); the IEC names for these powers of two are KiB/MiB/GiB/TiB.

Slide 18 — typical C++ sizes, with `sizeof` measured on x86-64 Linux (g++ 13):

| Type | Slide | Measured |
|---|---|---|
| `bool`, `char` | 1 byte | 1 |
| `short` | 2 | 2 |
| `int`, `float` | 4 | 4 |
| `long` | 4 or 8 | 8 |
| `long long`, `double` | 8 | 8 |
| pointer (`int*`) | 8 on 64-bit, 4 on 32-bit | 8 |

- **Static arrays**: element storage, 0 overhead. **Dynamic arrays** and **objects**: storage + variable overhead.
- **Pointers**: 8 bytes on 64-bit. **References**: no guaranteed size (implementation-dependent).

> ⚠️ **Pitfall**: `long` is 4 bytes on 64-bit Windows; use `std::int64_t` if you need an exact width.

> 📘 **Beyond the lecture** (algs4): objects are padded for alignment — measured, `struct { char c; double d; }` is **16** bytes, not 9.

---

## 5. Why Data Structures?

Slide 20: a data structure **organizes and stores data** so the needed operations are efficient (an unorganized vs. a categorized library). It is judged by **time** and **space** complexity, and there's **no one-size-fits-all** — hence many structures.

Slide 21's typical operations: **insertion, deletion, searching, replacement**, plus **traversal, sorting, check if empty**. No single structure does all of them efficiently; the choice depends on your data, which operations you need (and how often), and technical limits (memory, real-time).

Slide 22, **linear vs. non-linear**:

| Linear (sequence; each element has a previous/next) | Non-linear (hierarchical / interconnected) |
|---|---|
| Contiguous: arrays, ArrayLists (today) | Trees: binary trees, BSTs |
| Pointer-based: singly/doubly linked lists (Lec 4) | Graphs: nodes and edges |
| Sequential access: stacks, queues | non-contiguous memory, non-sequential traversal |

---

## 6. ArrayList (Dynamic Array)

### 6.1 State (slides 24–25)

An ArrayList (resizable / dynamic array) is a **zero-indexed linear structure** in **contiguous memory**, backed by an **underlying array of some capacity**. Like an array it has **O(1) access by index**. It holds three things: the **elements** array, the **size** (number of items), and the **capacity** (allocated length). It allocates/frees automatically, uses the first `size` cells, and when full allocates a larger array and copies everything over. It parallels `std::vector`.

Slide 24's picture — capacity 8, size 3, the dashed cells are allocated but unused:

```viz arraylist
{"title": "Slide 24: capacity 8, size 3", "ops": "add(ICS46); add(ROCKS); add(!)", "capacity": 8, "start": 7, "code": "none"}
```

Invariant: **size ≤ capacity**; cells `[size, capacity)` hold nothing meaningful.

### 6.2 API (slide 26)

| Group | Operation | Meaning |
|---|---|---|
| Constructors | `ArrayList()` | empty, **initial capacity 2** |
| | `ArrayList(int capacity)` | empty, given capacity |
| Inspection | `isEmpty()`, `size()`, `at(int index)` | empty?, item count, item at index |
| Modifiers | `add(Item item)` | append at the end |
| | `add(int index, Item item)` | insert, shift later items right |
| | `Item remove()` | remove and return the last item |
| | `Item remove(int index)` | remove at index, shift later items left |
| | `set(int index, Item item)` | replace item at index |

The trace slides use the `std::string` version (`void add(const std::string& s)`).

### 6.3 Trace (slides 27–35)

Each slide adds a line and asks "What should happen?":

| Slide | Call | Contents | Size | Cap | What happened |
|---|---|---|---|---|---|
| 27 | `ArrayList a1;` | — | 0 | 2 | default capacity 2 |
| 28 | `a1.add("ICS46");` | ICS46 | 1 | 2 | store at index size |
| 29 | `a1.add("Rocks");` | ICS46, Rocks | 2 | 2 | now full |
| 30 | `a1.add("!");` | ICS46, Rocks, ! | 3 | **4** | full → double, copy, then add |
| 31 | `a1.add(1, "Throws");` | ICS46, Throws, Rocks, ! | 4 | 4 | shift Rocks, ! right |
| 32 | `a1.add(3, "?");` | ICS46, Throws, Rocks, ?, ! | 5 | **8** | full → double, shift right, add |
| 33 | `a1.remove();` | ICS46, Throws, Rocks, ? | 4 | 8 | returns `!` |
| 34 | `a1.remove();` | ICS46, Throws, Rocks | 3 | 8 | returns `?` |
| 35 | `a1.remove();` | ICS46, Throws | 2 | **4** | returns `Rocks`; 2/8 = ¼ full → halve |

Running the slide program against [§8](#8-complete-implementation) gives the same states (`a1.at(5)` afterwards throws `out_of_range: index 5`).

The whole trace, one element move at a time — try your own calls in the box underneath. Step through it below (← / → keys work when the demo is focused):

```viz arraylist
{"title": "Slides 27–35", "ops": "add(ICS46); add(Rocks); add(!); add(1, Throws); add(3, ?); remove(); remove(); remove()", "interactive": true}
```

> ⚠️ **Slide bug**: p32's header says `remove()` but the step shown is `a1.add(3, "?")` (header carried over from p33).

> 📝 **Practice**: [ArrayList trace](#94-arraylist-trace-what-should-happen-slides-2735)

### 6.4 What a resize does (slide 30)

On a full array, `add` allocates double the capacity, copies all n elements (**the Θ(n) part**), frees the old array, repoints `data_`, then stores the item. The pointer change is the lesson, so here it is once:

Slide 30's `a1.add("!")` on the full capacity-2 array (it opens on the resize). Step through it below (← / → keys work when the demo is focused):

```viz arraylist
{"title": "Slide 30: add on a full ArrayList", "ops": "add(ICS46); add(Rocks); add(!)", "start": 7}
```

`add(index, item)` instead shifts `data_[index..n-1]` one slot right, **back-to-front** (`for (size_t i = n_; i > index; --i) data_[i] = data_[i-1];`), so nothing is overwritten before it's moved; `remove(index)` shifts left, front-to-back.

> ⚠️ **Pitfall**: copy **first**, then `delete[]`, then reassign — deleting first loses the data, reassigning first leaks the old buffer.

### 6.5 Running times

| Operation | Worst | Amortized |
|---|---|---|
| `isEmpty`, `size`, `at`, `set` | O(1) | — |
| `add(x)` (end) | O(n) | **O(1)** |
| `remove()` (end) | O(n) with shrinking | O(1) |
| `add(i, x)`, `remove(i)` | O(n) (shifting) | O(n) |

Great at the end and at random access, bad at the front/middle — Lecture 4's linked lists make the opposite trade.

---

## 7. Resizing and Amortized Analysis

### 7.1 Policy and worst case (slides 36–38)

| | Expand | Shrink |
|---|---|---|
| Trigger | adding to a **full** list | list becomes **¼ full** |
| Action | capacity × 2 | capacity × ½ |
| Cost | copy all elements | copy all elements |

**Key question (slide 38):** worst case of `add()`? **Cost model:** 1 for the insertion, n for copying n items. So one `add` costs 1 normally and n + 1 when it resizes: **worst case O(n)**. That's too pessimistic for a sequence of adds — hence amortized analysis.

> 📘 **Beyond the lecture**: shrinking at ¼ (not ½) avoids thrashing — at ½, alternating add/remove at the boundary would resize, costing Θ(n), on every call.

### 7.2 Amortized cost (slide 39)

**Amortized cost per operation** = total cost of a sequence of n operations ÷ n. Methods: **aggregate** (bound the total T(n), divide by n — used here), **accounting** (charge a fixed price, bank credit), **potential** (a potential function stores "energy").

> 💡 **Key Insight**: amortized ≠ average case. No probability: it's a worst-case guarantee on the *total* of any sequence.

### 7.3 Doubling vs. growing by 1 (slides 40–44)

Start at capacity 1 and call `add` n times. The (k+1)-th add copies k elements when the array is full:

| k | 0 | 1 | 2 | 3 | 4 | 5–7 | 8 | 9–15 | 16 |
|---|---|---|---|---|---|---|---|---|---|
| Copy cost, ×2 (slides 40–43) | 0 | 1 | 2 | 0 | 4 | 0 | 8 | 0 | 16 |
| Copy cost, +1 (slide 44) | 0 | 1 | 2 | 3 | 4 | 5–7 | 8 | 9–15 | 16 |

(Insertion cost is 1 in every column; total = insertion + copy.)

Watch the copies pile up with +1 growth — switch `growth` in your head to doubling and compare with the table. Step through it below (← / → keys work when the demo is focused):

```viz arraylist
{"title": "Growing by +1: every add after the first copies everything", "ops": "add(A); add(B); add(C); add(D); add(E); add(F)", "capacity": 1, "growth": "plus1"}
```

- **Doubling:** copies $= 1 + 2 + 4 + \dots + 2^{\lfloor \log_2 n \rfloor} \le 2n$ (geometric, ratio 2), insertions $= n$, total $\le 3n$ → **amortized O(1)**, but "lumpy": resizes come half as often and cost twice as much.
- **+1:** total $= n + (0 + 1 + \dots + (n-1)) = n + n(n-1)/2 = \Theta(n^2)$ → **amortized Θ(n)**.

Measured element copies (start capacity 1):

```text
n=17  doubling: 31 copies (2.82353 per add)   +1: 136 copies (9 per add)
n=1000000  doubling: 1048575 copies (2.04858 per add)   +1: 499999500000 copies (500000 per add)
```

> ⚠️ **Pitfall**: say "`add` is **amortized** O(1), **worst case** O(n)" — dropping "amortized" is wrong.

> 📘 **Beyond the lecture** (Thornton): amortized O(1) is fine for total time but not when *every* operation has a deadline (real-time control, 60 fps games) — one O(n) resize is a missed frame.

> 📝 **Practice**: [Activity 2](#95-activity-2-amortized-analysis---increase-by-1-slide-44)

---

## 8. Complete Implementation

```cpp
#include <cstddef>
#include <stdexcept>
#include <string>
#include <utility>

template <typename T>
class ArrayList {
public:
    ArrayList() : ArrayList(2) {}                       // slide 26: initial capacity 2
    explicit ArrayList(size_t capacity)
        : data_{new T[capacity > 0 ? capacity : 1]},
          capacity_{capacity > 0 ? capacity : 1}, n_{0} {}

    // Rule of three: we own data_, so copying must copy the buffer.
    ~ArrayList() { delete[] data_; }
    ArrayList(const ArrayList& other)
        : data_{new T[other.capacity_]}, capacity_{other.capacity_}, n_{other.n_} {
        for (size_t i = 0; i < n_; ++i) data_[i] = other.data_[i];
    }
    ArrayList& operator=(ArrayList other) {             // copy-and-swap
        std::swap(data_, other.data_);
        std::swap(capacity_, other.capacity_);
        std::swap(n_, other.n_);
        return *this;
    }

    bool isEmpty() const { return n_ == 0; }
    size_t size() const { return n_; }
    size_t capacity() const { return capacity_; }

    const T& at(size_t index) const { rangeCheck(index); return data_[index]; }

    void set(size_t index, const T& item) { rangeCheck(index); data_[index] = item; }

    void add(const T& item) {                          // append at the end
        if (n_ == capacity_) resize(2 * capacity_);
        data_[n_++] = item;
    }

    void add(size_t index, const T& item) {            // insert, shift right
        if (index > n_) throw std::out_of_range("add: index " + std::to_string(index));
        if (n_ == capacity_) resize(2 * capacity_);
        for (size_t i = n_; i > index; --i) data_[i] = data_[i - 1];
        data_[index] = item;
        ++n_;
    }

    T remove() {                                       // remove from the end
        if (n_ == 0) throw std::out_of_range("remove from empty ArrayList");
        T item = data_[--n_];
        shrinkIfSparse();
        return item;
    }

    T remove(size_t index) {                           // remove at index, shift left
        rangeCheck(index);
        T item = data_[index];
        for (size_t i = index; i + 1 < n_; ++i) data_[i] = data_[i + 1];
        --n_;
        shrinkIfSparse();
        return item;
    }

private:
    T* data_;
    size_t capacity_;
    size_t n_;

    void rangeCheck(size_t index) const {
        if (index >= n_) throw std::out_of_range("index " + std::to_string(index));
    }
    void shrinkIfSparse() {                            // slide 36: halve when 1/4 full
        if (capacity_ > 1 && n_ <= capacity_ / 4) resize(capacity_ / 2);
    }
    void resize(size_t newCapacity) {
        T* bigger = new T[newCapacity];
        for (size_t i = 0; i < n_; ++i) bigger[i] = data_[i];
        delete[] data_;
        data_ = bigger;
        capacity_ = newCapacity;
    }
};
```

---

## 9. In-class Activities (with Solutions)

### 9.1 Activity 3: 2-Sum (Lec 02 slide 34; solution slide 4)

Given n distinct numbers, how many unordered duplets sum to 0? How many of each type of operation (variable declaration, assignment, less than, equal to, array access, increment) as a function of **n**? (Code as in [§1](#1-the-2-sum-problem-counting-operations).)

**Solution.** Declarations $n+2$, assignments $n+2$, `<` $(n+1)(n+2)/2$, `==` $n(n-1)/2$, array accesses $n(n-1)$, increments $n(n+1)/2$ to $n^2$. Key reason: the inner body runs once per pair, $n(n-1)/2$ times, and each loop test runs once more than its body. Tilde: $\sim n^2$ array accesses.

### 9.2 Slide questions: reading bounds off a graph (slides 8, 11, 12)

**(a)** (slide 8) Which g(n) can be the Big-O of f(n) (a curve rising faster than the lines): $n$, $4n$, or $n^2$?
**(b)** (slide 11) Big-Omega of $f_1(n)$ and $f_2(n)$?
**(c)** (slide 12) Big-Theta of $f_1(n)$ and $f_2(n)$?

**Solution.** (a) Only $n^2$ — no constant multiple of a line stays above a curve that grows faster; $n$ and $4n$ are the same class anyway. (b) $f_1 = \Omega(1)$ (infinitely many tiny values), $f_2 = \Omega(n)$. (c) $f_1$: O(n) but Ω(1), so **Θ undefined**; $f_2 = \Theta(n)$.

### 9.3 Activity 1: Big-O, Big-Omega, Big-Theta (slide 14)

Given an array of n 3-digit integers in random order, describe the time complexity in terms of Big-O, Big-Omega, Big-Theta for: (a) 1. print all elements to std::out; 2. search the (unsorted) array for a number. (b) Big-O of: 1. T(n) = 7n − 2000; 2. T(n) = n³ + 46n² + 10000; 3. T(n) = 3 log n + 5n.

**Solution.**

| Task | O | Ω | Θ |
|---|---|---|---|
| print all | O(n) | Ω(n) | Θ(n) — every input visits all n |
| search unsorted | O(n) | Ω(1) | none without a case (best Θ(1), worst Θ(n)) |

(b) 1. O(n) (−2000 only matters for small n). 2. O(n³). 3. O(n) (log n grows slower than n).

### 9.4 ArrayList trace: "What should happen?" (slides 27–35)

Starting from `ArrayList a1;`, predict contents, size and capacity after: `add("ICS46")`, `add("Rocks")`, `add("!")`, `add(1, "Throws")`, `add(3, "?")`, then three `remove()`s.

**Solution.** 1/2 → 2/2 (full) → `!` triggers doubling: 3/4 → Throws shifts Rocks, ! right: 4/4 → `?` triggers doubling to 8, `!` shifts: [ICS46, Throws, Rocks, ?, !] 5/8 → removes return `!`, `?`, `Rocks`; at 2/8 = ¼ capacity halves: [ICS46, Throws] 2/4. Table: [§6.3](#63-trace-slides-2735).

### 9.5 Activity 2: Amortized Analysis - increase by 1 (slide 44)

What is the amortized time complexity of ArrayList's `add()` if we only add 1 additional element when it's full?

**Solution.** **Θ(n) per add.** The array is full before every add, so the (k+1)-th add copies k elements: total $n + n(n-1)/2 = \Theta(n^2)$, divided by n. Doubling gives ≤ 3n total, O(1) amortized.

---

## 10. Quick Reference & Top 5 Things to Remember

| Topic | Fact |
|---|---|
| $O / \Omega / \Theta$ | ≤ / ≥ / both, for some $c, n_0$ and all $n \ge n_0$ |
| Growth order | $1 < \log n < n < n\log n < n^2 < n^3 < 2^n < n!$ |
| 2-Sum brute force | $\sim n^2$ array accesses, $\Theta(n^2)$ |
| ArrayList `at` / `set` / `size` | O(1) |
| ArrayList `add(x)`, `remove()` at end | amortized O(1), worst O(n) |
| ArrayList `add(i,x)` / `remove(i)` | O(n) |
| Resize policy | default cap 2; ×2 when full; ×½ when ¼ full |
| Growth by +1 | amortized Θ(n) per `add` |

### Top 5 things to remember

1. Big-O is an upper bound, Big-Ω a lower bound, Big-Θ both — and Θ is undefined when they differ.
2. Case (best/average/worst) and bound (O/Ω/Θ) are separate questions: fix the case, then bound it.
3. To read Big-O off a formula, keep the fastest-growing term and drop its constant ($7n - 2000 = O(n)$).
4. ArrayList `add` is amortized O(1) but worst case O(n), because doubling makes copies a geometric series ≤ 2n.
5. Growing capacity by a constant instead of a factor makes `add` amortized Θ(n) (n adds cost Θ(n²)).
