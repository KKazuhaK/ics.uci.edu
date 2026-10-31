# Information and Computer Science 46 — Lecture 9: Quick Sort

## Table of Contents

- [1. Quick Sort: the Idea](#1-quick-sort-the-idea)
- [2. Partitioning (Hoare 2-Pointer Scheme)](#2-partitioning-hoare-2-pointer-scheme)
- [3. Tracing One Partition](#3-tracing-one-partition)
- [4. Full Sort Trace](#4-full-sort-trace)
- [5. Analysis: Worst, Best, Average](#5-analysis-worst-best-average)
- [6. Properties and "Sorting: Story So Far"](#6-properties-and-sorting-story-so-far)
- [7. Quick Sort Improvements](#7-quick-sort-improvements)
- [8. Complete Implementation](#8-complete-implementation)
- [9. In-class Activities (with Solutions)](#9-in-class-activities-with-solutions)
- [10. Quick Reference & Top 5 Things to Remember](#10-quick-reference--top-5-things-to-remember)

> UCI ICS 46: Data Structure Implementation and Analysis — Prof. Tom Yeh, Fall 2026, 10/27/26
> Built from the Lecture 9 slides (which repeat and finish the quick sort material started at the end of Lecture 8), with algs4 §2.3 Quicksort, algs4 §2.2 (lower bound) and Thornton's ComparisonBasedSorting notes as supplements. Organized by concept, not by source.

> 📅 **Class logistics**: Quiz 3 on Friday (Stacks, Queues, Deques) · HW 5 due Friday · Lab 4 due next Monday
> Approved AI tools released: **Learning Sentinel** (metacognition from learning activities) and **iGPT** (pedagogical AI tutor). Submit the 2-part consent form for access — (1) store data for tool access, (2) de-identified research use — for ★ 1% extra credit (an alternate extra-credit method comes later in the quarter).

> ➡️ Quick sort's history (Hoare, 1959) and merge sort are in the [Lecture 8 notes](lec-08.en-US.md). The Trees section at the end of this deck is in the [Lecture 10 notes](lec-10.en-US.md).

---

## 1. Quick Sort: the Idea

Quick sort is divide-and-conquer, like merge sort, but the work happens **before** the recursion instead of after it (slide 5):

1. **Shuffle** the array (randomly).
2. **Partition** so that, for some pivot index `j`:
   - entry `a[j]` is in its final place,
   - no larger entry is to the left of `j`,
   - no smaller entry is to the right of `j`.
3. **Sort** each subarray recursively. There is no merge step — once both sides are sorted, the whole array is sorted.

| | before | after partition |
|---|---|---|
| layout | `v` (pivot at `lo`), then unknowns up to `hi` | `≤ v` … `v` (at `j`) … `≥ v` |

Slide 6's code (the recursive driver plus the public entry point):

```cpp
#include <random>
#include <utility>

// quicksort
template <typename T>
void sort(T* a, int lo, int hi)
{
    if (hi <= lo) return;
    int j = partition(a, lo, hi);
    sort(a, lo, j-1);
    sort(a, j+1, hi);
}

template <typename T>
void sort(T* a, int length) {
    std::random_device device;                          // Random shuffle
    std::default_random_engine engine{device()};
    std::shuffle(std::begin(a), std::end(a), engine);

    sort(a, 0, length-1);
}
```

Example (slide 5, from algs4): input `Q U I C K S O R T E X A M P L E` → shuffle → `K R A T E L E P U I M Q C X O S` → partition on `K` → `E C A I E K L P U T M Q R X O S` → sort left → sort right → `A C E E I K L M O P Q R S T U X`.

> ⚠️ **Slide bugs** (code on slides 6 and 9):
> `std::shuffle(std::begin(a), std::end(a), engine)` does not compile — `a` is a `T*`, and `std::begin`/`std::end` need an array or container. Fix: `std::shuffle(a, a + length, engine);`
> `std::shuffle` is declared in `<algorithm>`, which the slide doesn't include. Fix: add `#include <algorithm>`.

> 💡 **Key Insight**: Merge sort = trivial split, hard combine. Quick sort = hard split (partition), trivial combine. Each partition puts **one** element (the pivot) in its final position, which is why the recursion always terminates — each subarray is strictly smaller.

## 2. Partitioning (Hoare 2-Pointer Scheme)

Goal (slide 7): rearrange `a[lo..hi]` so that `a[lo..j-1] <= a[j] <= a[j+1..hi]`.

- The pivot `v` is `a[lo]` ("simplest method"). Pointer `i` starts at `lo`, `j` at `hi + 1`.
- Repeat until `i` and `j` cross:
  - scan `i` left→right **while `a[i] < v`** (stop at a key **≥** the pivot);
  - scan `j` right→left **while `v < a[j]`** (stop at a key **≤** the pivot);
  - if `i >= j`, break;
  - exchange `a[i]` with `a[j]`.
- Finally exchange `a[lo]` with `a[j]` and return `j`.

Why swap with `a[j]` and not `a[i]`? When the scans cross, `j` sits on the last element of the `≤ v` region, so swapping the pivot there keeps everything left of it `≤ v`.

Slide 8's code:

```cpp
template <typename T>
int partition(T* a, int lo, int hi) {
    int i = lo;
    int j = hi + 1;
    T v = a[lo];
    while (true) {

        // Move i to the right for elements < v

        while (i < hi && a[++i] < v) {
            if (i == hi) break;
        }
        // Move j to the left for elements > v

        while (v < a[--j]) {
            if (j == lo) break;
        }
        if (i >= j) break;         // If pointers cross, stop

        std::swap(a[i], a[j]);     // Swap elements at i and j
    }
    // Place the partitioning item in its correct position
    std::swap(a[lo], a[j]);
    return j;
}
```

The `i == hi` / `j == lo` guards keep the scans inside the subarray when the pivot is the largest or smallest key. (The `j == lo` guard is actually redundant — `a[lo]` is `v` itself and `v < v` is false — but it's harmless.) The slide title spells the name "Sedgwick"; it's Robert **Sedgewick**.

> ⚠️ **Pitfall**: Pre-increment matters. `a[++i]` moves first, then compares, so the first element `i` looks at is `a[lo+1]` (the pivot is skipped). Likewise `a[--j]` starts at `a[hi]` because `j` begins at `hi + 1`.

> 📘 **Beyond the lecture**: Both scans **stop on keys equal to the pivot** (`<`, not `<=`). That looks like it causes useless swaps, but it is what keeps quick sort fast on arrays full of duplicates: with all-equal keys, stopping makes `i` and `j` meet in the middle (an even split → n log n), while not stopping would run one pointer to the end and give a 0 / n−1 split → quadratic time (algs4 §2.3).

## 3. Tracing One Partition

Slides 9–35 step through the first partition of the shuffled array `K R A T E L E P U I M Q C X O S` with `v = K`:

| round | `i` stops at | `j` stops at | action | array after |
|---|---|---|---|---|
| 1 | 1 (`R` ≥ K) | 12 (`C` ≤ K) | swap | `K C A T E L E P U I M Q R X O S` |
| 2 | 3 (`T`) | 9 (`I`) | swap | `K C A I E L E P U T M Q R X O S` |
| 3 | 5 (`L`) | 6 (`E`) | swap | `K C A I E E L P U T M Q R X O S` |
| 4 | 6 (`L`) | 5 (`E`) | `i >= j` → break | — |
| end | | | `swap(a[0], a[5])`, return 5 | `E C A I E K L P U T M Q R X O S` |

After it: `K` is at index 5 for good, everything left of it is `≤ K`, everything right is `≥ K`. Then `sort` recurses on `lo = 0, hi = 4` (slide 35; slide 37 shows the start of that call: `E C A I E`, `i = 0`, `j = 5`).

Step through it below (← / → keys work when the demo is focused):

```viz quick-sort
{"title": "Slides 9–35: partition(a, 0, 15), v = K", "items": "K, R, A, T, E, L, E, P, U, I, M, Q, C, X, O, S", "mode": "partition"}
```

## 4. Full Sort Trace

Slide 36 (algs4's trace) lists every `partition` call. Each row is the array after partitioning `a[lo..hi]` around the pivot that ends up at `j`; rows with `lo == hi` (or `hi < lo`) are size-1/0 subarrays — **no partition** happens, `sort` just returns.

| lo | j | hi | array after this call |
|---|---|---|---|
| 0 | 5 | 15 | E C A I E **K** L P U T M Q R X O S |
| 0 | 3 | 4 | E C A **E** I K L P U T M Q R X O S |
| 0 | 2 | 2 | A C **E** E I K … |
| 0 | 0 | 1 | **A** C E E I K … |
| 6 | 6 | 15 | A C E E I K **L** P U T M Q R X O S |
| 7 | 9 | 15 | … L M O **P** T Q R X U S |
| 7 | 7 | 8 | … L **M** O P … |
| 10 | 13 | 15 | … P S Q R **T** U X |
| 10 | 12 | 12 | … P R Q **S** T U X |
| 10 | 11 | 11 | … P Q **R** S T U X |
| 14 | 14 | 15 | … T **U** X |
| | | | A C E E I K L M O P Q R S T U X |

On the slide, **pink** marks the left call `sort(a, lo, j-1)`, **blue** the right call `sort(a, j+1, hi)`, **red** the pivot. Notice the order: the left subarray is completely sorted before the right one is touched (depth-first recursion).

```viz quick-sort
{"title": "Slide 36: full quick sort of the shuffled array", "items": "K, R, A, T, E, L, E, P, U, I, M, Q, C, X, O, S", "mode": "sort", "interactive": true}
```

> 📝 **Practice**: [Activity 1](#91-activity-1-sort-with-quick-sort-slide-38) — sort `3 7 8 5 2 1 9 5 4` by hand.

## 5. Analysis: Worst, Best, Average

One call to `partition` on `n` elements is **O(n)**: `i` and `j` together sweep the subarray once (about n + 1 compares). So everything depends on **where the pivot lands**.

| case | scenario | recurrence | solution |
|---|---|---|---|
| worst | pivot is always the smallest or largest key → splits of 0 and n−1 (e.g. already sorted or reverse-sorted input with no shuffle) | T(n) = T(n−1) + n | n + (n−1) + … + 2 ≈ n²/2 → **O(n²)** |
| best | pivot is always the median → two halves | T(n) = 2T(n/2) + n | lg n levels × n work per level → **O(n log n)** |
| average | random shuffle → pivot rank is uniformly random | — | **O(n log n)** |

Measured with the slide code (no shuffle, sorted input of size n): n = 100 → 5,148 compares, n = 200 → 20,298, n = 400 → 80,598 — about n²/2, quadrupling each time n doubles. The same sorted input of size 1,000 **with** the shuffle took 12,083 compares.

What reduces the chance of the worst case? The **random shuffle** at the start: no fixed input (sorted, reversed, …) is bad any more; only unlucky random choices are, and those are vanishingly unlikely for large n. That's the "probabilistic guarantee" on slide 40.

> 📘 **Beyond the lecture**: The average is about **2n ln n ≈ 1.39 n lg n** compares (algs4 §2.3), while merge sort uses at most about n lg n. That ratio is where slide 40's "39% more compares than merge sort" comes from.

> 📝 **Practice**: [Activity 2](#92-activity-2-quick-sort-analysis-slide-39) — worst/best case scenario and recurrence.

## 6. Properties and "Sorting: Story So Far"

Slide 40, notes about quick sort:

- **39% more compares than merge sort, but faster in practice.** Why:
  - fewer data moves (merge sort copies every element to `aux` and back at every level);
  - good cache behavior — partition scans memory sequentially, which works well with prefetch;
  - no extra memory allocation.
- **Random shuffle** gives a probabilistic guarantee against the worst case.
- O(n log n) average, O(n²) worst.
- **In-place**: only swaps inside the array (plus the recursion stack).
- **Not stable**: long-distance swaps can reorder equal keys. Example from Activity 1: partitioning `5 8 7 9 5 4` around the first `5` ends with `swap(a[lo], a[j])` exchanging the two `5`s.

Slide 41's summary table:

| Sort | In place | Stable | Best | Average | Worst | Remarks |
|---|---|---|---|---|---|---|
| Selection | ✓ | | O(n²) | O(n²) | O(n²) | n exchanges |
| Insertion | ✓ | ✓ | O(n) | O(n²) | O(n²) | use for small arrays or partially ordered |
| Merge | | ✓ | O(n log n) | O(n log n) | O(n log n) | guaranteed performance; stable |
| Quick | ✓ | | O(n log n) | O(n log n) | **O(n²)** | n log n probabilistic guarantee; fastest in practice |

- **All comparison-based sorting algorithms have a lower bound of n log n in the worst case** (slide: "O(n log n)"; strictly it's a lower bound, Ω).
- Quick sort's performance shows Big-O is an **incomplete model** of real-world performance: it has the worst Big-O of the n log n sorts and is still the fastest.

> 📘 **Beyond the lecture**: Why n log n can't be beaten: a comparison sort must distinguish all n! orderings of the input, and each compare has only two outcomes, so some input needs at least lg(n!) ≈ n lg n compares (algs4 §2.2). Merge sort meets this bound, so it is asymptotically optimal.

## 7. Quick Sort Improvements

Slide 42:

1. **For small subarrays, use insertion sort** — recursion overhead dominates on tiny subarrays, and insertion sort is fast there (same trick as merge sort in Lecture 8).
2. **Improve pivot selection** (and drop the up-front random shuffle):
   - use a **random element** as the pivot (swap it into `a[lo]`, then partition as usual);
   - use the **median of a small sample** as the pivot — a better split on average.

> 📘 **Beyond the lecture**: algs4 suggests a cutoff anywhere from about 5 to 15 elements for switching to insertion sort, and says a sample of **3** (median-of-three) captures most of the benefit of median-of-sample.

Slide 43 links "dance" videos of [merge sort](https://www.youtube.com/watch?v=XaqR3G_NVoo) and [quick sort](https://www.youtube.com/watch?v=3San3uKKHgg) — the quick sort dance uses a **different partition variant** than the one in lecture, so don't use it to check traces.

## 8. Complete Implementation

```cpp
#include <algorithm>
#include <random>
#include <utility>

template <typename T>
int partition(T* a, int lo, int hi) {
    int i = lo;
    int j = hi + 1;
    T v = a[lo];
    while (true) {
        while (i < hi && a[++i] < v) {
            if (i == hi) break;
        }
        while (v < a[--j]) {
            if (j == lo) break;
        }
        if (i >= j) break;
        std::swap(a[i], a[j]);
    }
    std::swap(a[lo], a[j]);
    return j;
}

template <typename T>
void sort(T* a, int lo, int hi) {
    if (hi <= lo) return;
    int j = partition(a, lo, hi);
    sort(a, lo, j - 1);
    sort(a, j + 1, hi);
}

template <typename T>
void sort(T* a, int length) {
    std::random_device device;
    std::default_random_engine engine{device()};
    std::shuffle(a, a + length, engine);  // fixed
    sort(a, 0, length - 1);
}
```

## 9. In-class Activities (with Solutions)

### 9.1 Activity 1: Sort with quick sort (slide 38)

Sort the following with quick sort:
note: assume use of lo for pivot

| 3 | 7 | 8 | 5 | 2 | 1 | 9 | 5 | 4 |
|---|---|---|---|---|---|---|---|---|

(Slide note: Visualgo's quicksort implementation is different from what's presented.)

> ✍️ **Try it first.** Hint: no shuffle; run `partition` exactly as coded — `i` stops on ≥ pivot, `j` stops on ≤ pivot.

**Solution.** First partition, `lo = 0, hi = 8`, `v = 3`:

| round | `i` stops | `j` stops | action | array |
|---|---|---|---|---|
| 1 | 1 (7) | 5 (1) | swap | 3 1 8 5 2 7 9 5 4 |
| 2 | 2 (8) | 4 (2) | swap | 3 1 2 5 8 7 9 5 4 |
| 3 | 3 (5) | 2 (2) | cross → break | |
| end | | | swap a[0], a[2]; j = 2 | 2 1 **3** 5 8 7 9 5 4 |

All calls:

| lo | j | hi | array after |
|---|---|---|---|
| 0 | 2 | 8 | 2 1 **3** 5 8 7 9 5 4 |
| 0 | 1 | 1 | 1 **2** 3 5 8 7 9 5 4 |
| 3 | 5 | 8 | 1 2 3 5 4 **5** 9 7 8 |
| 3 | 4 | 4 | 1 2 3 4 **5** 5 9 7 8 |
| 6 | 8 | 8 | 1 2 3 4 5 5 8 7 **9** |
| 6 | 7 | 7 | 1 2 3 4 5 5 7 **8** 9 |
| | | | 1 2 3 4 5 5 7 8 9 |

The trap is the call on `5 8 7 9 5 4` (`v = 5`): `j` stops on the second `5` because it's **equal** to the pivot (`5 < 5` is false), so the two `5`s get swapped — quick sort is not stable. Check it step by step:

```viz quick-sort
{"title": "Activity 1 check (slide 38)", "items": "3, 7, 8, 5, 2, 1, 9, 5, 4", "mode": "sort"}
```

Back to [§4 Full Sort Trace](#4-full-sort-trace).

### 9.2 Activity 2: Quick Sort Analysis (slide 39)

**Worst Case Analysis**
**(a)** Scenario — when does this occur?
**(b)** Mathematical model — identify then solve the recurrence.

**Best Case Analysis**
**(c)** Scenario — when does this occur?
**(d)** Mathematical model — identify then solve the recurrence.

**(e)** What reduces the likelihood of the worst case happening?

> ✍️ **Try it first.**

**Solution.**

**(a)** Every pivot is the smallest (or largest) key of its subarray, so each partition peels off just one element: one side is empty, the other has n − 1. With pivot = `a[lo]` and no shuffle, an already-sorted (or reverse-sorted) array does this.

**(b)** T(n) = T(n − 1) + n (partition is O(n)). Unrolling: n + (n − 1) + … + 2 ≈ n²/2 → **O(n²)**.

**(c)** Every pivot lands in the middle (it's the median), splitting into two halves.

**(d)** T(n) = 2T(n/2) + n — the merge sort recurrence: lg n levels, n work per level → **O(n log n)**.

**(e)** The **random shuffle** before sorting (or a random / median-of-sample pivot): the worst case then needs extremely unlucky random choices instead of a common input like a sorted array.

Back to [§5 Analysis](#5-analysis-worst-best-average).

## 10. Quick Reference & Top 5 Things to Remember

| Operation | Cost |
|---|---|
| `partition(a, lo, hi)` | O(n) for n = hi − lo + 1 |
| quick sort, best / average | O(n log n) |
| quick sort, worst | O(n²) (pivot always min/max) |
| extra memory | in-place (recursion stack only) |
| stable? | no |

| Partition rule | |
|---|---|
| pivot | `v = a[lo]` |
| start | `i = lo`, `j = hi + 1` |
| `i` scan | `while (a[++i] < v)` — stops on ≥ v |
| `j` scan | `while (v < a[--j])` — stops on ≤ v |
| stop | `i >= j` |
| finish | `swap(a[lo], a[j])`, return `j` |

**Top 5 things to remember**

1. Partition puts the pivot in its final spot with `≤ v` on its left and `≥ v` on its right; then recurse on `lo..j-1` and `j+1..hi` — no merge step.
2. Both scans stop on keys **equal** to the pivot, and the final swap is with `a[j]`, not `a[i]` — hand traces live or die on these two details.
3. Worst case T(n) = T(n−1) + n = O(n²) when the pivot is always the min or max (sorted input with pivot `a[lo]` and no shuffle); best case T(n) = 2T(n/2) + n = O(n log n).
4. The random shuffle (or random / median-of-3 pivot) makes the worst case improbable; average is O(n log n) with ~39% more compares than merge sort, yet quick sort is faster in practice (fewer moves, cache-friendly, no extra array).
5. Quick sort is in-place but not stable; merge sort is stable but not in-place; no comparison sort beats n log n in the worst case.