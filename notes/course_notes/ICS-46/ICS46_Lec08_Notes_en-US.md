# Information and Computer Science 46 — Lecture 8: Merge Sort, Quick Sort

## Table of Contents

- [1. Merge Sort: the Idea](#1-merge-sort-the-idea)
- [2. Merging Two Sorted Halves](#2-merging-two-sorted-halves)
- [3. The Recursive sort and the Wrapper](#3-the-recursive-sort-and-the-wrapper)
- [4. Tracing Merge Sort on M E R G E S R T](#4-tracing-merge-sort-on-m-e-r-g-e-s-r-t)
- [5. Analysis of Merge Sort](#5-analysis-of-merge-sort)
- [6. Merge Sort Properties and Improvements](#6-merge-sort-properties-and-improvements)
- [7. Quick Sort: Background](#7-quick-sort-background)
- [8. Complete Implementation](#8-complete-implementation)
- [9. In-class Activities (with Solutions)](#9-in-class-activities-with-solutions)
- [10. Quick Reference & Top 5 Things to Remember](#10-quick-reference--top-5-things-to-remember)

> UCI ICS 46: Data Structure Implementation and Analysis — Prof. Tom Yeh, Fall 2026, 10/22/26
> Built from the Lecture 8 slides (p1–49); supplements: algs4 §2.2 Mergesort, Thornton's "Comparison-Based Sorting". Organized by concept, not by source.
> Slides 50–83 (quick sort algorithm, code, partitioning, traces, Activity 4) are repeated in the Lecture 9 deck, so they are covered in the [Lecture 9 notes](?kind=course_notes&course=ICS-46&lang=en-US&note=ICS46_Lec09_Notes_en-US.md).
> Today's goals (slide 3): merge sort and its analysis, quick sort. The merge part (slides 4–20) was also at the end of Lecture 7 and is covered here. Selection and insertion sort are in the [Lecture 7 notes](?kind=course_notes&course=ICS-46&lang=en-US&note=ICS46_Lec07_Notes_en-US.md); recurrences and the master theorem are in the [Lecture 6 notes](?kind=course_notes&course=ICS-46&lang=en-US&note=ICS46_Lec06_Notes_en-US.md).

> 📅 **Class logistics** (slide 2):
> Quiz 2 this **Friday**
> HW 3 due **Friday**
> Lab 3 due **next Monday**
> A course-approved AI tool will be released soon

---

## 1. Merge Sort: the Idea

Merge sort was invented by John von Neumann in 1945 and is "the quintessential example of divide and conquer" (slide 22). The algorithm (slide 21):

1. **Divide** the array into two halves.
2. **Recursively sort** each half.
3. **Merge** the two sorted halves.

Slide 5's overview on `M E R G E S O R T E X A M P L E`:

| step | array |
| --- | --- |
| input | M E R G E S O R T E X A M P L E |
| sort left half | E E G M O R R S \| T E X A M P L E |
| sort right half | E E G M O R R S \| A E E L M P T X |
| merge results | A E E E E G L M M O P R R S T X |

> 💡 **Key Insight**: Splitting is trivial (cut at the middle index). All the real work, every comparison, happens in `merge()`.

## 2. Merging Two Sorted Halves

`merge` takes `a[lo..mid]` and `a[mid+1..hi]`, which are **each already sorted**, and makes `a[lo..hi]` sorted (slide 6). It first copies the range into the auxiliary array `aux`, then writes back into `a` one position `k` at a time:

```cpp
template <typename T>
void merge(T* a, T* aux, int lo, int mid, int hi)
{
    for (int k = lo; k <= hi; k++)       // Copy from a to aux
        aux[k] = a[k];

    int i = lo, j = mid + 1;

    for (int k = lo; k <= hi; k++) {     // Merge back into a
        if (i > mid)                     // Left subarray is exhausted
            a[k] = aux[j++];
        else if (j > hi)                 // Right subarray is exhausted
            a[k] = aux[i++];
        else if (aux[j] < aux[i])        // Select from right subarray
            a[k] = aux[j++];
        else                             // Select from left subarray
            a[k] = aux[i++];
    }
}
```

What each index tracks (slides 8–9):

- `i` = next unused item of the **left** half in `aux` (valid while `i <= mid`)
- `j` = next unused item of the **right** half in `aux` (valid while `j <= hi`)
- `k` = next slot of `a` to fill

`i > mid` means the left half is used up, `j > hi` means the right half is used up; then the rest is copied without comparing. Only when both halves still have items does the third branch compare `aux[j] < aux[i]`, and the smaller one wins. The slide's "cards demo": two sorted piles face up, always take the smaller top card.

Slides 7–18 merge `aux = A G L O R | H I M S T` (lo = 0, mid = 4, hi = 9):

| k | case | assignment | a after |
| --- | --- | --- | --- |
| 0 | aux[i] < aux[j] (A vs H) | a[0] = aux[0] | **A** |
| 1 | G vs H | a[1] = aux[1] | A **G** |
| 2 | aux[i] > aux[j] (L vs H) | a[2] = aux[5] | A G **H** |
| 3 | L vs I | a[3] = aux[6] | A G H **I** |
| 4 | L vs M | a[4] = aux[2] | … **L** |
| 5 | O vs M | a[5] = aux[7] | … **M** |
| 6 | O vs S | a[6] = aux[3] | … **O** |
| 7 | R vs S | a[7] = aux[4] | … **R** |
| 8 | i > mid | a[8] = aux[8] | … **S** |
| 9 | i > mid | a[9] = aux[9] | A G H I L M O R S T |

Step through it below (← / → keys work when the demo is focused):

```viz merge-sort
{"title": "Slides 7–18: merge A G L O R | H I M S T", "items": "A, G, L, O, R, H, I, M, S, T", "mode": "merge", "mid": 4}
```

Slide 19 links the Algorithms 2.2 "Merging Demo" video showing the same process.

> ⚠️ **Pitfall**: `merge` is only correct if both halves are already sorted. It never looks back, so an unsorted half just comes out in its original order mixed with the other half.

> 📝 **Practice**: [Activity 1](#91-activity-1-comparisons-in-merge-slide-20) counts the comparisons `merge` makes.

## 3. The Recursive sort and the Wrapper

Slides 22–23:

```cpp
template <typename T>
void sort(T* a, T* aux, int lo, int hi)
{
    if (hi <= lo)                        // Base case for recursion
        return;

    int mid = lo + (hi - lo) / 2;        // calculate midpoint, split in half
    sort(a, aux, lo, mid);               // recursively sort left subarray
    sort(a, aux, mid+1, hi);             // recursively sort right subarray
    merge(a, aux, lo, mid, hi);          // merge left and right
}

template <typename T>
void sort(T* a, int length)
{
    T* aux = new T[length];              // Dynamically allocate aux array
    sort(a, aux, 0, length - 1);
    delete[] aux;
}
```

- `lo` and `hi` are **inclusive**, so the wrapper passes `length - 1`.
- Base case `hi <= lo`: a range of 0 or 1 items is already sorted.
- `mid = lo + (hi - lo) / 2` equals `(lo + hi) / 2` but cannot overflow `int`. Left half `lo..mid` gets the extra item when the length is odd.
- The two `sort` functions are **overloads**. The user calls `sort(a, length)`; the wrapper allocates `aux` **once** and passes it down, instead of allocating inside every `merge`.
- `new T[length]` pairs with `delete[]`.

Note from slide 23: `std::sort` and `std::merge` are already in `<algorithm>`; we write our own to understand them.

## 4. Tracing Merge Sort on M E R G E S R T

Slides 24–41 follow `sort([M,E,R,G,E,S,R,T])`. The call order is **depth-first**: keep going left until a base case (the slides draw a brick wall), then do the right side, then merge on the way back up.

| call | what happens | a afterwards |
| --- | --- | --- |
| sort(0,7) | mid = 3, go left | M E R G E S R T |
| sort(0,3) | mid = 1, go left | |
| sort(0,1) | mid = 0; sort(0,0) and sort(1,1) hit the base case; merge(0,0,1) | **E M** R G E S R T |
| sort(2,3) | sort(2,2), sort(3,3) return; merge(2,2,3) | E M **G R** E S R T |
| back in sort(0,3) | merge(0,1,3) | **E G M R** E S R T |
| sort(4,7) | same pattern on E S R T | E G M R **E R S T** |
| back in sort(0,7) | merge(0,3,7) | **E E G M R R S T** |

Slide 41 shows the whole recursion tree: `MERG | ESRT` → `ME RG ES RT` → single letters → `EM GR ES RT` → `EGMR ERST` → `EEGMRRST`. The `aux` array keeps old copies between merges (e.g. `[M, E, R, G, , , , ]`); that is harmless because each `merge` re-copies its own range first.

Step through the whole recursion (edit the items to try your own):

```viz merge-sort
{"title": "Slides 24–41: sort M E R G E S R T", "items": "M, E, R, G, E, S, R, T", "interactive": true}
```

> 📝 **Practice**: [Activity 2](#92-activity-2-subarray-lengths-slide-42) asks which subarray lengths appear for n = 10.

## 5. Analysis of Merge Sort

**Why it matters** (slide 43): with 10¹⁰ comparisons/s (laptop) vs 10¹⁷ (supercomputer):

| computer | insertion sort: thousand | million | billion | mergesort: thousand | million | billion |
| --- | --- | --- | --- | --- | --- | --- |
| laptop | instant | 2 hours | 300 years | instant | 1 sec | 15 min |
| supercomputer | instant | 1 sec | 1 week | instant | instant | instant |

A laptop running merge sort beats a supercomputer running insertion sort: good algorithms are better than supercomputers.

**Counting comparisons** (Activity 3, slide 44). One `merge` of n items makes at most **n − 1** comparisons: each comparison places one item, and the last item is always placed without one (the other half is already empty). So the worst-case count satisfies

$$C(n) = 2\,C(n/2) + (n - 1), \qquad C(1) = 0$$

(the two recursive sorts, plus the final merge; computing `mid` costs no comparisons). For growth order, write $T(n) = 2T(n/2) + n$.

- **Recursion tree**: level k has 2ᵏ subproblems of size n/2ᵏ, so each level merges n items in total. Halving n until it reaches 1 takes log₂ n levels. Total ≈ n · log₂ n. Exactly, $C(n) = n\log_2 n - n + 1$ for n a power of 2 (n = 8 → 17).
- **Master theorem** ($T(n) = aT(n/b) + n^d$): a = 2, b = 2, d = 1, and a = bᵈ, so $T(n) = \Theta(n^d \log n) = \Theta(n \log n)$.

Counting all work (copies to `aux`, index updates) instead of comparisons only changes the constant: each `merge` is still Θ(n), so the answer is the same **Θ(n log n)** in the best, average and worst case.

> 📘 **Beyond the lecture**: algs4 §2.2 states the full range: merge sort uses between ½ n lg n and n lg n comparisons for any input of size n. The best case is half the worst because one merge needs at least n/2 comparisons (one half runs out first).

> 📝 **Practice**: [Activity 3](#93-activity-3-worst-case-analysis-slide-44) is this derivation.

## 6. Merge Sort Properties and Improvements

Slide 45:

- **Extra memory ∝ n**: `aux` must hold n items for the last merge.
- **Not in-place** in its simplest form. There are modifications that halve the auxiliary array (the slide says "halting", a typo for "halving"), but a truly in-place merge is very hard.
- **Stable**: equal keys keep their original order. In `merge`, the right item is taken only if `aux[j] < aux[i]`; on a tie the `else` branch takes the **left** one, which came first.

Improvements (slide 46):

1. Use **insertion sort** for small subarrays.
2. **Stop** if already sorted.
3. **Eliminate the copy** to the auxiliary array to save time.

> 📘 **Beyond the lecture**: what the three improvements mean concretely (algs4 §2.2): (1) cutting off to insertion sort below ~10–15 items speeds up a typical merge sort by 10–15%; (2) skip `merge` when `a[mid] <= a[mid+1]`, which makes an already sorted input linear; (3) alternate the roles of `a` and `aux` at each recursion level, saving the copy time (not the space).

Sorting so far (slide 47):

| | in place | stable | best | average | worst | remarks |
| --- | --- | --- | --- | --- | --- | --- |
| selection | ✓ | | O(n²) | O(n²) | O(n²) | n exchanges |
| insertion | ✓ | ✓ | O(n) | O(n²) | O(n²) | use for small arrays or partially sorted |
| merge sort | | ✓ | O(n log n) | O(n log n) | O(n log n) | guaranteed performance; stable |

> ⚠️ **Pitfall**: change the tie-break to `aux[j] <= aux[i]` and merge sort is no longer stable (equal items from the right jump ahead).

## 7. Quick Sort: Background

Quick sort (slide 49) is also divide-and-conquer, invented by Sir Tony Hoare in 1959. He wanted to sort words before looking them up in a dictionary, came up with quicksort but did not know how to implement it, then learned Algol 60 and recursion and implemented it. He won the 1980 Turing Award (and also invented null, which he regretted).

> ➡️ **Continued in [Lecture 9](?kind=course_notes&course=ICS-46&lang=en-US&note=ICS46_Lec09_Notes_en-US.md)**: the algorithm sketch, quick sort code and random shuffle, partitioning, the partition and full-sort traces, and this deck's Activity 4 (Lecture 9's Activity 1). Slides 50–83 are repeated at the start of the Lecture 9 deck, so they are covered there.

## 8. Complete Implementation

```cpp
#include <utility>

namespace mergesort {
template <typename T>
void merge(T* a, T* aux, int lo, int mid, int hi) {
    for (int k = lo; k <= hi; k++) aux[k] = a[k];
    int i = lo, j = mid + 1;
    for (int k = lo; k <= hi; k++) {
        if (i > mid)              a[k] = aux[j++];
        else if (j > hi)          a[k] = aux[i++];
        else if (aux[j] < aux[i]) a[k] = aux[j++];
        else                      a[k] = aux[i++];
    }
}
template <typename T>
void sort(T* a, T* aux, int lo, int hi) {
    if (hi <= lo) return;
    int mid = lo + (hi - lo) / 2;
    sort(a, aux, lo, mid);
    sort(a, aux, mid+1, hi);
    merge(a, aux, lo, mid, hi);
}
template <typename T>
void sort(T* a, int length) {
    T* aux = new T[length];
    sort(a, aux, 0, length - 1);
    delete[] aux;
}
}
```

Tested with `g++ -std=c++17 -Wall -fsanitize=address,undefined` (comparisons counted with an instrumented `operator<`):

```text
merge example: AGHILMORST  compares=8
best 123|456 compares=3
worst 135|246 compares=5
MERGESRT -> EEGMRRST  compares=15
worst n=8 compares=17 (n lg n - n + 1 = 17)
mergesort wrapper: 1 2 3 5 8 9
```

## 9. In-class Activities (with Solutions)

### 9.1 Activity 1: comparisons in merge (slide 20)

How many calls does `merge()` make to `<` in order to merge two already sorted subarrays, each of length n/2, into a sorted array of length n?

A. ~ n/4 to ~ n/2
B. ~ n/2
C. ~ n/2 to n
D. ~ n
E. ~ n to 2n

Provide a best case example and a worst case example (use 3 elements in each sorted subarray).

> ✍️ **Try it first.** Hint: every comparison places exactly one item; no comparisons happen once a half runs out.

**Solution: C.** Best case: one half runs out after n/2 comparisons, e.g. `1 2 3 | 4 5 6` → 3 comparisons (1, 2, 3 each beat 4; then 4 5 6 are copied). Worst case: the halves interleave so neither runs out until the end, e.g. `1 3 5 | 2 4 6` → 5 = n − 1 comparisons. So between ~n/2 and ~n. Check the worst case:

```viz merge-sort
{"title": "Activity 1 worst case: 1 3 5 | 2 4 6", "items": "1, 3, 5, 2, 4, 6", "mode": "merge", "mid": 2}
```

Back to [Merging Two Sorted Halves](#2-merging-two-sorted-halves).

### 9.2 Activity 2: subarray lengths (slide 42)

Which of the following subarray lengths will occur when running merge sort on an array of length 10?

A. { 1, 2, 3, 5, 7, 10 }
B. { 2, 4, 6, 8, 10 }
C. { 1, 2, 5, 10 }
D. { 1, 2, 3, 4, 5, 10 }
E. { 1, 2, 3, 5, 10 }

> ✍️ **Try it first.**

**Solution: E.** A length-n range splits into ⌈n/2⌉ (left, it gets `mid`) and ⌊n/2⌋: 10 → 5 + 5, 5 → 3 + 2, 3 → 2 + 1, 2 → 1 + 1. Lengths: 10, 5, 3, 2, 1. A has 7, B and D have even lengths that never appear (and B lacks 1, which every recursion reaches), C misses 3. Back to [the trace](#4-tracing-merge-sort-on-m-e-r-g-e-s-r-t).

### 9.3 Activity 3: worst-case analysis (slide 44)

**(a)** Analyze the worst-case time complexity of merge sort (number of comparisons).
**(b)** Write the recurrence to describe worst-case time complexity.
**(c)** Use recursion tree or master theorem to solve the recurrence.

> ✍️ **Try it first.**

**Solution.** **(a)** All comparisons happen in `merge`; merging n items takes at most n − 1. **(b)** $C(n) = 2C(n/2) + (n - 1)$, $C(1) = 0$; as growth order $T(n) = 2T(n/2) + n$. **(c)** Tree: log₂ n levels × n per level = n log₂ n (exactly n log₂ n − n + 1). Master theorem: a = 2, b = 2, d = 1, a = bᵈ → Θ(n log n). Back to [Analysis of Merge Sort](#5-analysis-of-merge-sort).

## 10. Quick Reference & Top 5 Things to Remember

| | merge sort |
| --- | --- |
| split | at the middle index (`mid`) |
| work done | after the recursive calls (`merge`) |
| comparisons happen | `aux[j] < aux[i]` in merge |
| extra memory | `aux` of size n (not in-place) |
| stable | yes (ties go left) |
| time | Θ(n log n) best/average/worst |
| comparisons to merge two halves of n/2 | between ~n/2 and n − 1 |

**Top 5 things to remember**

1. `merge` compares `aux[j] < aux[i]` only while both halves have items; `i > mid` / `j > hi` mean a half is exhausted, and ties take the left item, which makes merge sort stable.
2. Merge sort's recurrence is $C(n) = 2C(n/2) + (n - 1)$: log₂ n levels × n per level = Θ(n log n) in every case, at the cost of an O(n) `aux` array (not in-place).
3. Subarray lengths come from repeatedly splitting into ⌈n/2⌉ and ⌊n/2⌋ (n = 10 → 10, 5, 3, 2, 1).
4. Merging two sorted halves of n/2 takes between n/2 (one half runs out first) and n − 1 comparisons (the halves interleave).
5. The three improvements: insertion sort for small subarrays, skip `merge` when `a[mid] <= a[mid+1]`, and alternate `a`/`aux` to avoid the copy.
