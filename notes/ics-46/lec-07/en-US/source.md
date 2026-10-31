# Information and Computer Science 46 — Lecture 7: Sorting

## Table of Contents

- [1. Circular Array Queue](#1-circular-array-queue)
- [2. Deques](#2-deques)
- [3. Why Study Sorting](#3-why-study-sorting)
- [4. Sorting Basics: Keys, Cost Model, Memory, Stability](#4-sorting-basics-keys-cost-model-memory-stability)
- [5. Selection Sort](#5-selection-sort)
- [6. Insertion Sort](#6-insertion-sort)
- [7. Selection vs Insertion Sort](#7-selection-vs-insertion-sort)
- [8. In-class Activities (with Solutions)](#8-in-class-activities-with-solutions)
- [9. Quick Reference & Top 5 Things to Remember](#9-quick-reference--top-5-things-to-remember)

> UCI ICS 46: Data Structure Implementation and Analysis — Prof. Tom Yeh, Fall 2026, 10/20/26
> Built from the Lecture 7 slides (pages 1–27; the merge-sort part, pages 28–44, is repeated in Lecture 8 and lives in those notes). Lecture 6's sorting slides (its pages 18–39, Activities 3–6) are the same material and are covered here. Supplements: Alex Thornton's ICS 46 notes "Stacks, Queues, and Deques" and "Comparison-Based Sorting", and algs4 §2.1 Elementary Sorts. Organized by concept, not by source.

> 📅 **Class logistics**: Today's OH hosted by LAs.
> Quiz 2 on Friday — paper assessment, arrive on time; covers Algorithm Analysis, ArrayList, Linked List.
> HW 3 due Friday; Lab 3 due next Monday.
> A course-approved AI tool will be released soon for lab and project assignments. Plagiarism checks run at the end of the quarter; an academic-integrity violation means a zero and loss of flexibility (low-grade drops).

---

## 1. Circular Array Queue

### 1.1 Why not a plain ArrayList?

A queue enqueues at the rear and dequeues at the front. If you keep the queue in an ArrayList with the front fixed at index 0, every `dequeue()` must shift all remaining elements left, which costs O(n) (slide p4: `[A B C D]` → dequeue → `[B C D]`).

A **circular array** lets the starting index move instead. On dequeue, the **front index** just advances. No element moves, so dequeue is O(1) (slide p4: after dequeuing A, `front` moves from 0 to 1 and B, C stay where they are).

> 📘 **Beyond the lecture** (Thornton, *Stacks, Queues, and Deques*): `std::vector` used normally has the same problem. It always keeps its elements in cells 0…size−1, so one end of the queue is stuck at cell 0, and either enqueue or dequeue becomes Θ(n). The fix is a plain array whose front and back indices "float".

### 1.2 Front, rear and wrap-around

A circular-array queue implements a queue in a **fixed-size array** and keeps two indices:

- `front_idx`: the position of the front element.
- `rear_idx`: by one convention the **last valid entry**, by the other the **next empty index**. The slides' algorithms use "next empty index".

Both indices only move forward. When one reaches the end of the array it **wraps around** to 0 with modulo arithmetic:

```text
index = (index + 1) % capacity
```

So the queue's elements are the slots from `front` going right, possibly continuing at slot 0 (slide p5: capacity 6, `front_idx = 1`, the queue is A B C D in slots 1–4, and the rear is at slot 4).

| Operation | Algorithm (slide p6) | Cost |
|---|---|---|
| enqueue(value) | `array[rear_idx] = value;` `rear_idx = (rear_idx + 1) % capacity;` | O(1) |
| dequeue() | `val = array[front_idx];` `front_idx = (front_idx + 1) % capacity;` return `val` | O(1) |

Step through it below (← / → keys work when the demo is focused). The site's demo uses the "track the size" convention from 1.3: rear slot = `(front + n) % capacity`. Watch F wrap into slot 0:

```viz circular-queue
{"title": "Slides p4–6: queue on a circular array, capacity 5", "ops": "A B C D - - E F G", "capacity": 5, "interactive": true}
```

> ⚠️ **Pitfall**: slide p6 labels enqueue and dequeue "amortized O(1)". For a fixed-capacity circular array both are plain **O(1) worst case**. "Amortized" only enters if the array **resizes** when full (the challenge question in [Activity 1](#81-activity-1-circular-array-implementation-slide-8)).

### 1.3 Full vs empty

If `rear_idx` is the next empty slot, then `front == rear` both when the queue is empty and when it has filled every slot. The slides give two ways to tell them apart:

1. **Always keep one slot empty.** Then
   - empty: `front == rear`
   - full: `(rear + 1) % capacity == front`

   The cost is one wasted slot.
2. **Track the size** `n`. Empty is `n == 0`, full is `n == capacity`, and you don't need `rear` at all, because it equals `(front + n) % capacity`.

---

## 2. Deques

A **deque** (double-ended queue, pronounced "deck") adds and removes at **both** ends (slide p7):

| Operation | Meaning |
|---|---|
| `enqueueFront(x)` / `enqueueBack(x)` | add at the front / back |
| `dequeueFront()` / `dequeueBack()` | remove and return from the front / back |
| `front()` / `back()` | look at the front / back element without removing it |

- With a **front index** pointing at the first element and a **rear index** pointing at where the next element goes (or at the last element), a deque is a circular array in which **both indices move in both directions**. `enqueueFront` steps `front` *left*, wrapping from 0 to `capacity − 1`: `front = (front - 1 + capacity) % capacity`. `dequeueBack` steps the rear left the same way.
- It is a **versatile structure**: use only one end and you have a stack; add at one end and remove at the other and you have a queue.
- C++ ships one: `std::deque`.
- As a **linked list**, a deque needs removals at both ends, so use a **doubly linked list** (a singly linked list can't remove its last node in O(1)). See [Lecture 4](lec-04.en-US.md).

> ⚠️ **Pitfall**: `(front - 1) % capacity` is **−1** in C++ when `front` is 0, because `%` keeps the sign of the left operand. Add `capacity` before taking `%`.

> 📝 **Practice**: [Activity 1](#81-activity-1-circular-array-implementation-slide-8) implements all four deque operations on a circular array, including resizing.

---

## 3. Why Study Sorting

Slide p10 gives three reasons:

1. **Practical utility.** Sorting is everywhere: by price, last name, size, date, zip code. It underlies user interfaces, database queries and data presentation.
2. **Benchmark.** It is a good way to compare the performance of different algorithms on exactly the same problem, and some sorting strategies are tied to specific data structures.
3. **Problem-solving tool.** Sorting your data first is often a good starting point (keep this in mind for interviews). It changes what you can do next: for example, a sorted array allows binary search.

There are many sorting algorithms (slide p11): adaptive heapsort, bitonic sorter (highly parallel, popular on GPUs), block sort, bubble sort, bucket sort, cascade mergesort, cocktail sort, comb sort, flashsort, gnome sort, **heapsort**, **insertion sort**, library sort, **mergesort**, odd-even sort, pancake sort, **quicksort**, radixsort, **selection sort**, shell sort, spaghetti sort, treesort, and more. The ones in bold are the ones this course studies. Today covers selection and insertion sort.

---

## 4. Sorting Basics: Keys, Cost Model, Memory, Stability

**Definitions (slide p12).**

- **Sorting** arranges the n items of a collection in non-decreasing order, numerically or alphabetically.
- When an item has several components, the **key** is the component we sort by. It decides the relative order. Example: a book can be sorted by title, by author (both alphabetical) or by ISBN (numerical).

**Two abstractions (slide p13).** Every algorithm today touches the data only through:

- **compare**: is `v` less than `w`? In C++ this is `operator<` (overloaded for your type) or a custom comparator function.
- **exchange**: swap `a[i]` and `a[j]`.

```cpp
T temp = a[i];      // manual swap
a[i] = a[j];
a[j] = temp;

std::swap(a[i], a[j]);   // standard library (#include <utility>)
```

**Cost model (slide p14).** We count **compares and exchanges**. For an algorithm that doesn't exchange, count array accesses instead. Not every sort is comparison-based: radix sort, for example, never compares two keys.

**Memory (slide p15).** Extra memory matters as much as running time.

| Category | Extra memory |
|---|---|
| **In place** | constant or logarithmic extra memory beyond the items being sorted |
| **Not in place** | linear extra memory, proportional to the input size |

**Stability (slide p16).** A sort is **stable** if items with equal keys come out in the same relative order they went in. The slide uses cards sorted by rank. Input 7♠ 5♥ 2♥ 5♠: a stable sort gives 2♥ **5♥ 5♠** 7♠ (5♥ was first, so it stays first). An unstable sort may give 2♥ **5♠ 5♥** 7♠.

> 📘 **Beyond the lecture** (Thornton, *Comparison-Based Sorting*): stability is what lets you sort by several keys in turn. Sort people by first name, then **stably** by last name. The result is ordered by last name, and people with the same last name stay ordered by first name. An unstable second sort could scramble those ties.

---

## 5. Selection Sort

**Idea (slides p18–19).** Divide the array into a **sorted subarray on the left** and an **unsorted subarray on the right**. Repeat:

- find the **smallest** element in the unsorted part,
- exchange it with the **leftmost unsorted** element,
- move the boundary one element to the right.

```cpp
#include <utility>// for std::swap
template <typename T>
void selectionSort(T* arr, int size) {
   for (int i = 0; i < size - 1; i++) {
      // Find index of smallest remaining element
      int min = i;
      for (int j = i + 1; j < size; j++) {
         if (arr[j] < arr[min]) {
            min = j;
         }
      }

      // efficient swap using move semantics
      std::swap(arr[i], arr[min]);
   }
}
```

**Invariants (slide p20).** At the end of iteration i:

- `arr[0…i]` is sorted in ascending order, and
- no entry in `arr[i+1…n−1]` is smaller than any entry in `arr[0…i]`.

So after iteration i, `arr[0…i]` holds the final values for those positions and is never touched again. The last element is automatically in place, which is why the outer loop stops at `size − 1`.

Step through it on the slide's array `3 44 38 5 47 1 36 26` (→ `1 3 5 26 36 38 44 47`):

```viz selection-sort
{"title": "Slides p18–19: selection sort on the slide's array", "array": [3, 44, 38, 5, 47, 1, 36, 26], "interactive": true}
```

**Analysis.**

- **Comparisons:** iteration i scans n − 1 − i elements, so the total is (n−1) + (n−2) + … + 1 = n(n−1)/2 ≈ n²/2, i.e. **O(n²)**. This is the same for every input, because the scan can't stop early.
- **Exchanges:** one per iteration, n − 1 in total, so **O(n)** (the slide's code also "swaps" when `min == i`).
- **Already sorted?** Still n(n−1)/2 comparisons, so still O(n²). Selection sort can't notice that the data is sorted.
- **In place:** yes, only `i`, `j` and `min` are extra.
- **Stable:** no. The long-distance swap can jump an element over an equal one. Example: `5♥ 5♠ 2♥`. Pass 0 swaps 2♥ with 5♥, giving `2♥ 5♠ 5♥`, so the two fives are now reversed.

Measured with counters on n = 1000 (this matches the formulas: 1000·999/2 = 499,500):

```text
n=1000 sorted:   selection cmps=499500 swaps=999
n=1000 reversed: selection cmps=499500 swaps=999
```

> 📘 **Beyond the lecture** (algs4 §2.1): because selection sort does at most n − 1 exchanges, it is the one to choose when **moving** items is far more expensive than comparing them. algs4's example is a warehouse clerk reordering heavy crates by reading their labels.

> 📝 **Practice**: [Activity 2](#82-activity-2-selection-sort-slide-21) traces selection sort by hand and answers these analysis questions.

---

## 6. Insertion Sort

**Idea (slides p23–25).** Keep a *partially* sorted subarray on the left and an unsorted subarray on the right. Repeat:

- take the next element of the unsorted part,
- find where it belongs in the sorted part and insert it there,
- move the boundary one element to the right.

This is how most people sort a hand of cards. Unlike selection sort, the left part is sorted only *relative to itself*: later elements can still be inserted into it.

```cpp
#include <utility>// for std::swap
template <typename T>
void insertionSort(T* arr, int size) {
   for (int i = 0; i < size ; i++) {
      for (int j = i; j > 0; j--) {      // slide: "j–" (see bug note)
         if (arr[j] < arr[j-1]) {
            std::swap(arr[j], arr[j-1]);
         }
         else break;
      }
   }
}
```

> ⚠️ **Slide bug**: slide p26 has `j–` (an en dash) in the inner loop, which doesn't compile. It must be `j--`. (The outer loop starting at `i = 0` is harmless: pass 0 does nothing.)

The inner loop swaps `arr[j]` **left past every larger neighbour**. At the first neighbour that is not larger it **breaks**: everything further left is sorted, so the element is already in place. That early exit is the whole difference from selection sort.

Step through it on the same slide array:

```viz insertion-sort
{"title": "Slides p23–25: insertion sort on the slide's array", "array": [3, 44, 38, 5, 47, 1, 36, 26], "interactive": true}
```

**Analysis.**

| Input | Comparisons | Exchanges | Big-O |
|---|---|---|---|
| **Best**: already sorted | n − 1 (each pass: one compare, then break) | 0 | **O(n)** |
| **Worst**: reverse sorted | n(n−1)/2 (each element travels all the way to the front) | n(n−1)/2 | **O(n²)** |
| Average (random) | ≈ n²/4 | ≈ n²/4 | O(n²) |

```text
n=1000 sorted:   insertion cmps=999    swaps=0
n=1000 reversed: insertion cmps=499500 swaps=499500
```

- **In place:** yes.
- **Stable:** yes. It swaps only when `arr[j] < arr[j-1]` (strictly less), so an element never moves past an equal one. Sorting the slide's cards 7♠ 5♥ 2♥ 5♠ by rank gives `2H 5H 5S 7S`: 5♥ stays ahead of 5♠.

> 📘 **Beyond the lecture** (algs4 §2.1): the number of exchanges insertion sort makes is exactly the number of **inversions**, the pairs of items that are out of order. So on a *partially sorted* array (few inversions, e.g. a sorted list with a few new items appended) insertion sort runs in nearly linear time. This is why it is used for small or nearly sorted inputs.

> 📝 **Practice**: [Activity 3](#83-activity-3-insertion-sort-slide-27) traces insertion sort by hand and asks for the best and worst case.

---

## 7. Selection vs Insertion Sort

| | Selection sort | Insertion sort |
|---|---|---|
| Comparisons, worst | n(n−1)/2 → O(n²) | n(n−1)/2 → O(n²) (reverse sorted) |
| Comparisons, best | n(n−1)/2 → O(n²) (always) | n − 1 → O(n) (already sorted) |
| Exchanges | n − 1 → O(n), always | 0 (best) to n(n−1)/2 (worst) |
| In place | yes | yes |
| Stable | **no** (long-distance swaps) | **yes** (swaps only adjacent, strictly smaller) |
| Strength | fewest exchanges | fast on sorted / nearly sorted data |

> 💡 **Key Insight**: both are O(n²) in the worst case. Selection sort pays n²/2 comparisons *every* time. Insertion sort pays only for the disorder that is actually there.

> ➡️ **Continued in [Lecture 8](lec-08.en-US.md)**: merge sort (merge implementation and trace, slides p28–44 of this deck, repeated in Lecture 8).

---

## 8. In-class Activities (with Solutions)

### 8.1 Activity 1: Circular Array Implementation (slide 8)

Implement the following methods of a deque on a circular array and update the front/rear indices:

1. `enqueueFront(val)`: add element to the front of the deque
2. `enqueueBack(val)`: add element to the rear of the deque
3. `dequeueFront()`: remove and return the element from the front
4. `dequeueBack()`: remove and return the element from the rear

**Challenge question:** how do we update the deque when dynamically resizing the circular array? (Adding to a full deque requires expanding capacity.)

> ✍️ **Try it first.** Hint: keep `front` and the size `n`; then the back element is at `(front + n − 1) % capacity`.

**Solution.** Track `front` and `n` (option 2 of [section 1.3](#13-full-vs-empty)). The rear slot is `(front + n) % capacity`.

```cpp
void enqueueFront(const T& val) {
    if (n == capacity) resize(2 * capacity);
    front = (front - 1 + capacity) % capacity;   // step left, wrapping
    data[front] = val;
    n++;
}
void enqueueBack(const T& val) {
    if (n == capacity) resize(2 * capacity);
    data[(front + n) % capacity] = val;          // rear slot
    n++;
}
T dequeueFront() {
    if (n == 0) throw std::underflow_error("empty deque");
    T val = data[front];
    front = (front + 1) % capacity;
    n--;
    return val;
}
T dequeueBack() {
    if (n == 0) throw std::underflow_error("empty deque");
    T val = data[(front + n - 1) % capacity];    // last element
    n--;
    return val;
}
```

**Challenge: resizing.** You can't copy the old array cell by cell into the same positions, because the elements may wrap around the end. The slide's three steps:

1. **Allocate** a larger array (double the capacity).
2. **Unroll** the elements into it sequentially, in deque order: new `[k]` = old `[(front + k) % oldCapacity]` for k = 0 … n−1.
3. **Reset** `front = 0` and `rear = size` (with the size-tracking version, `rear` simply follows from `n`).

```cpp
void resize(int newCap) {
    T* bigger = new T[newCap];
    for (int k = 0; k < n; k++)                  // unroll in deque order
        bigger[k] = data[(front + k) % capacity];
    delete[] data;
    data = bigger;
    capacity = newCap;
    front = 0;                                   // rear slot is now n
}
```

With doubling, each enqueue is **amortized O(1)** (the same argument as the ArrayList in Lecture 3); the dequeues are O(1). Test run starting at capacity 2: `enqueueBack(1); enqueueBack(2); enqueueFront(0); enqueueFront(-1); enqueueBack(3)`, then one `dequeueFront()`, one `dequeueBack()`, and dequeueFront until empty:

```text
deque size=5 capacity=8 : -1 3 0 1 2
```

### 8.2 Activity 2: Selection Sort (slide 21)

**(a)** Using selection sort, sort the array with elements [12, 10, 16, 11, 9, 7]. Visualize your work for every iteration of the algorithm.

**(b)** Runtime analysis:

- What is the Big-O notation of the worst-case running time? Number of comparisons? Number of exchanges?
- What if the data is already sorted?
- Is selection sort in-place? Why?
- Is it stable? Why?

(Lecture 6's Activities 3 and 4 ask the same questions.)

> ✍️ **Try it first.**

**Solution (a).** After each iteration i (the sorted prefix is `arr[0…i]`):

| After i | Array | Swapped |
|---|---|---|
| start | 12 10 16 11 9 7 | |
| 0 | **7** 10 16 11 9 12 | 12 ↔ 7 |
| 1 | **7 9** 16 11 10 12 | 10 ↔ 9 |
| 2 | **7 9 10** 11 16 12 | 16 ↔ 10 |
| 3 | **7 9 10 11** 16 12 | 11 is already the min (self-swap) |
| 4 | **7 9 10 11 12 16** | 16 ↔ 12 |

That is 15 comparisons (5 + 4 + 3 + 2 + 1 = 6·5/2) and 5 swaps. Check it below:

```viz selection-sort
{"title": "Activity 2(a): selection sort on [12, 10, 16, 11, 9, 7]", "array": [12, 10, 16, 11, 9, 7]}
```

**Solution (b).**

- Worst case **O(n²)**: n(n−1)/2 comparisons, n − 1 exchanges (O(n)).
- Already sorted: **no help**, still n(n−1)/2 comparisons, O(n²). The scan for the minimum always runs to the end.
- **In place:** yes. O(1) extra memory (`i`, `j`, `min`).
- **Not stable:** swapping `arr[i]` with a far-away minimum can jump `arr[i]` over an equal key (`5♥ 5♠ 2♥` → `2♥ 5♠ 5♥`). See [section 5](#5-selection-sort).

### 8.3 Activity 3: Insertion Sort (slide 27)

**(a)** Using insertion sort, sort the array with elements [12, 10, 16, 11, 9, 7]. Visualize your work for every iteration of the algorithm.

**(b)** Worst-case time complexity?

- Best case: when?
- Number of comparisons? Exchanges?

(Lecture 6's Activities 5 and 6 ask the same questions.)

> ✍️ **Try it first.**

**Solution (a).** After each pass i (the sorted prefix is `arr[0…i]`, the inserted element in bold):

| After i | Array | Comparisons | Swaps |
|---|---|---|---|
| 0 | **12** 10 16 11 9 7 | 0 | 0 |
| 1 | **10** 12 16 11 9 7 | 1 | 1 |
| 2 | 10 12 **16** 11 9 7 | 1 (16 > 12, break) | 0 |
| 3 | 10 **11** 12 16 9 7 | 3 (stops at 10) | 2 |
| 4 | **9** 10 11 12 16 7 | 4 (reaches the front) | 4 |
| 5 | **7** 9 10 11 12 16 | 5 (reaches the front) | 5 |

Total: 14 comparisons, 12 swaps. 12 is the number of inversions in the input. Check it below:

```viz insertion-sort
{"title": "Activity 3(a): insertion sort on [12, 10, 16, 11, 9, 7]", "array": [12, 10, 16, 11, 9, 7]}
```

**Solution (b).**

- **Worst case O(n²)**, when the input is **reverse sorted**: element i is swapped all the way to the front, so n(n−1)/2 comparisons and n(n−1)/2 exchanges.
- **Best case O(n)**, when the input is **already sorted**: each pass does one comparison, then `break`. That is n − 1 comparisons and 0 exchanges.
- The trap: selection sort's best case is still O(n²). Insertion sort's `break` is what makes its best case linear.

---

## 9. Quick Reference & Top 5 Things to Remember

**Circular array (queue / deque)**

| | Formula |
|---|---|
| advance an index | `i = (i + 1) % capacity` |
| step an index back | `i = (i - 1 + capacity) % capacity` |
| rear slot (tracking size n) | `(front + n) % capacity` |
| last element | `(front + n - 1) % capacity` |
| empty / full (one slot kept empty) | `front == rear` / `(rear + 1) % capacity == front` |
| empty / full (tracking size) | `n == 0` / `n == capacity` |

Queue and deque operations are O(1) on a fixed array, and amortized O(1) with doubling when full. A linked deque needs a doubly linked list.

**Elementary sorts**

| | Best | Worst | Exchanges | In place | Stable |
|---|---|---|---|---|---|
| Selection | O(n²) | O(n²) | n − 1 | yes | no |
| Insertion | O(n) (sorted) | O(n²) (reversed) | = # inversions | yes | yes |

**Top 5 things to remember**

1. A circular array avoids shifting: dequeue moves the front index, with wrap-around by `% capacity`, so enqueue and dequeue are O(1).
2. `front == rear` is ambiguous: either keep one slot empty or track the size. When stepping left, add `capacity` before `%`.
3. Selection sort always makes n(n−1)/2 comparisons, even on sorted input, but only n − 1 exchanges. It is in place and **not** stable.
4. Insertion sort is O(n) on sorted input (break after one comparison) and O(n²) on reversed input. Its exchanges equal the number of inversions, and it is in place and stable.
5. Stable = equal keys keep their input order. It matters when you sort the same data by more than one key.