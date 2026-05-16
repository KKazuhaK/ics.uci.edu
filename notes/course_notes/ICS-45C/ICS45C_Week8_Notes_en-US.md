# Information and Computer Science 45C — Week 8 Integrated Reading Notes

## Table of Contents

- [1. Weekly Learning Objectives](#1-weekly-learning-objectives)
- [2. The C++ Standard Library](#2-the-c-standard-library)
- [3. The STL Framework — General Concepts](#3-the-stl-framework--general-concepts)
- [4. Containers: Categories Overview](#4-containers-categories-overview)
- [5. Sequence Containers](#5-sequence-containers)
- [6. Associative Containers](#6-associative-containers)
- [7. Container Adapters](#7-container-adapters)
- [8. Matching Tasks to Containers (Klefstad Activity)](#8-matching-tasks-to-containers-klefstad-activity)
- [9. STL Iterators](#9-stl-iterators)
- [10. Iterator Categories](#10-iterator-categories)
- [11. STL Algorithms](#11-stl-algorithms)
- [12. Iterator Adapters](#12-iterator-adapters)
- [13. Function Objects in Algorithms](#13-function-objects-in-algorithms)
- [14. Ranges (C++20)](#14-ranges-c20)
- [15. I/O Streams — The iostream Library](#15-io-streams--the-iostream-library)
- [16. Input with istream](#16-input-with-istream)
- [17. Output with ostream and ios](#17-output-with-ostream-and-ios)
- [18. Week 8 Comprehensive Cheat Sheet](#18-week-8-comprehensive-cheat-sheet)
- [19. Top Five Takeaways for Week 8](#19-top-five-takeaways-for-week-8)

> UCI ICS 45C: Programming in C++ (35770)
> These notes integrate the Week 8 reading material: LearnCpp 21.1 (the standard library), 21.2 (STL containers overview), 21.3 (STL iterators overview), 21.4 (STL algorithms overview), 28.1 (input and output streams), 28.2 (input with istream), and 28.3 (output with ostream and ios); cppreference reference pages for `std::vector`, `std::set`, and `std::map`; and Klefstad's *Topic 8* PPT — STL containers, iterators, algorithms, insert/stream/reverse iterator adapters, container adapters, function objects, and ranges. Content is organized by **topic**, not by source.
> Note on cross-week PPT content: Slides 26–27 of Topic 8 PPT cover the **standard C++ exception hierarchy** (`std::bad_alloc`, `std::logic_error`, `std::runtime_error`, etc.). The exception-handling material is part of the Week 7 reading list (LearnCpp 27.x), so those slides are not duplicated here — they were already integrated into the Week 7 notes (sections 9–14). If you want a one-line recap of the standard exception hierarchy, see section 19.5 of the Week 7 cheat sheet.

---

## 1. Weekly Learning Objectives

> Bird's-eye view of the three conceptual blocks of Week 8

### 1.1 The Standard Template Library — STL (chapters 21.1–21.4)

- Understand: what the **C++ Standard Library** is and why it exists
- Master: the three-way decomposition of the STL — **containers, iterators, algorithms** — and how they compose
- Distinguish: **sequence containers** (vector, deque, list, array, forward_list, string) vs. **associative containers** (set, map, multiset, multimap, unordered variants) vs. **container adapters** (stack, queue, priority_queue)
- Master: choosing the right container for a task (sequence vs. associative; ordered vs. unordered; element-only vs. key/value)
- Master: the **iterator abstraction** — `begin()`, `end()`, `*`, `++`, `==`, the half-open range `[begin, end)`
- Understand: **iterator categories** (input, output, forward, bidirectional, random-access, contiguous) and why they exist
- Master: common **algorithms** — `sort`, `find`, `min_element`, `max_element`, `reverse`, `accumulate`, `transform`, `for_each`, `copy`
- Master: **iterator adapters** — `back_inserter`, `front_inserter`, `inserter`, `istream_iterator`, `ostream_iterator`, reverse iterators
- Understand: **function objects** (free functions, function pointers, lambdas) as algorithm arguments
- Be aware of: **C++20 ranges** as a higher-level alternative to passing `begin/end` pairs

### 1.2 I/O Streams (chapters 28.1–28.3)

- Understand: a **stream** is a sequence of bytes that can be read or written sequentially
- Master: the class hierarchy — `ios`, `istream`, `ostream`, `iostream`, the predefined `cin`/`cout`/`cerr`/`clog`
- Master: the **extraction operator (`>>`)** for input and the **insertion operator (`<<`)** for output, including whitespace-skipping behavior
- Master: input techniques: `setw()` to limit reads, `get()` / `getline()` (member and free), `gcount()`, `peek()`, `unget()`, `putback()`, `ignore()`
- Master: output formatting via **flags** (`setf`/`unsetf`) and **manipulators** (`std::hex`, `std::fixed`, `std::setprecision`, `std::setw`, `std::setfill`, `std::left`/`std::right`)
- Distinguish: flags that belong to **format groups** (only one flag in the group can be active at a time)

### 1.3 Bridge: Iterators connect everything

- The single big idea of the STL: **algorithms operate on iterator ranges, not containers.** Once a container supplies a pair of iterators, every algorithm in `<algorithm>` works on it.
- Stream iterators turn `cin`/`cout`/`ifstream`/`ofstream` into iterator ranges — so the same algorithms work on files and keyboards.

---

## 2. The C++ Standard Library

> Corresponds to LearnCpp 21.1

### 2.1 What is the Standard Library?

The **C++ Standard Library** is a collection of templated classes that provide reusable **containers, algorithms, and iterators**. The vast majority of typical programs — loops, strings, arrays, sorting, lookup — can be built from these pieces without rewriting them.

**Why use it:**

- The code is already written, debugged, and reasonably efficient
- It is **standardized**: the same `std::vector` behaves identically across compilers and platforms
- It removes a whole class of bugs that plague hand-written non-class versions of containers

**Why people fear it:**

- It is large and everything is templated, so error messages can be intimidating
- Best to learn it in bite-sized pieces — use what you need, ignore the rest

> 💡 **Key Insight (LearnCpp 21.1)**
> The Standard Library is **not** an extension to the C++ language — it lives in the `std` namespace. From C++'s point of view, you and `std::vector` are on equal footing: anyone who follows the conventions can write a container that algorithms can operate on. This is what makes STL **extensible by users**.

### 2.2 The STL: a subset of the Standard Library

The phrase **STL** (Standard Template Library) is sometimes used as a synonym for "the Standard Library," but historically the STL is the **container/iterator/algorithm framework** specifically, designed largely by **Alexander Stepanov**. Other parts of the Standard Library — `<iostream>`, `<chrono>`, `<filesystem>`, `<regex>`, etc. — are not strictly STL.

In this course, "STL" almost always means the container/iterator/algorithm portion.

---

## 3. The STL Framework — General Concepts

> Corresponds to Topic 8 PPT slides 1–2

### 3.1 The Three Pillars

Klefstad's slide states the design philosophy crisply:

> The STL is **a framework for defining composable library pieces**:
> - **containers** — hold things (stack, lists, maps, etc.)
> - **iterators** — connect each algorithm to each container
> - **algorithms** — do things (min, sort, etc.)

Imagine an M×N grid:

- M rows = M algorithms
- N columns = N containers
- Without iterators, every cell needs its own implementation → **M × N** versions
- With iterators, each algorithm is written **once** in terms of iterators, and each container exposes iterators **once** → only **M + N** pieces

That is why the STL scales.

### 3.2 Supporting Components

Two more pieces round out the framework:

- **Function objects** — anything callable that algorithms can use as a parameter. This includes ordinary functions, function pointers, function-pointer-like classes (`struct` with `operator()`), and lambdas (Week 7). They make algorithms **flexible** without needing thousands of overloads.
- **Standard exceptions** — for STL error handling (already covered in Week 7). These provide a uniform way for STL operations to report errors (`std::out_of_range`, `std::bad_alloc`, etc.).

### 3.3 Extending the STL

The STL is **extensible by users** who obey the conventions:

- Write a container that exposes `begin()` / `end()` and an iterator class with the appropriate operators → every STL algorithm now works on your container.
- Write a function object that conforms to the algorithm's expected signature → it can be passed to any algorithm that takes a callable.

You already practiced this idea in HW6 (the `Picture` linked list with custom iterator-style traversal).

---

## 4. Containers: Categories Overview

> Corresponds to LearnCpp 21.2 + Topic 8 PPT slide 3

### 4.1 The Three Container Families

| Family | What it does | Examples |
|---|---|---|
| **Sequence containers** | Maintain the **order of insertion**; you choose where to put each element | `vector`, `deque`, `array`, `list`, `forward_list`, `string` |
| **Associative containers** | Automatically **sort** elements (or hash them) on insertion; you don't control the order | `set`, `multiset`, `map`, `multimap`, `unordered_*` versions |
| **Container adapters** | Wrap an existing sequence container to expose a **restricted** interface (LIFO/FIFO/priority) | `stack`, `queue`, `priority_queue` |

### 4.2 The Klefstad Implementation Distinction (PPT slide 3)

> Klefstad emphasizes the two **implementation strategies** behind the containers:
> - **Array-based** — contiguous memory, fast random access (HW1 `Stack`, HW4 `String`)
> - **Linked-structure-based** — nodes with pointers, fast insertion in the middle (HW5 `String`, HW6 `Picture`)

This matters: when picking a container, the underlying data structure determines the **complexity** of each operation. A `vector` and a `list` both store a sequence, but `vector[i]` is O(1) while `list[i]` doesn't even exist (you must walk node by node — O(n)).

### 4.3 Python Comparison

| | Python | C++ STL |
|---|---|---|
| "List" | `list` (dynamic array) | `std::vector` (closest match) or `std::list` (linked list, **different**) |
| "Dict" | `dict` (hash table) | `std::unordered_map` (hash) or `std::map` (balanced BST, **ordered**) |
| "Set" | `set` (hash table) | `std::unordered_set` (hash) or `std::set` (balanced BST, **ordered**) |
| Insertion order preserved | Yes since 3.7 (dict) | Only in sequence containers; associative containers are sorted, not insertion-ordered |
| Heterogeneous element types | Yes | No — every container holds elements of one specific type |

> ⚠️ **Pitfall**
> Python's `list` is C++'s `std::vector`, **not** C++'s `std::list`. The names are misleading — C++ `std::list` is a doubly linked list with no random-access `[]` operator.

---

## 5. Sequence Containers

> Corresponds to LearnCpp 21.2 (sequence containers section) + Topic 8 PPT slide 6

Sequence containers all preserve the **order you insert in**. The choice between them comes down to which operations need to be fast and which can be slow.

### 5.1 `std::vector`

A **dynamically resizable array** stored in contiguous memory. The single most-used container in modern C++.

**Defining characteristics:**

- Contiguous memory layout (so `&v[0]` points to a real C-style array)
- **Random access** in O(1) via `operator[]` and `at()`
- **Append/pop at the back** is O(1) amortized: `push_back()`, `pop_back()`, `back()`
- Insertion or removal in the middle is O(n) (everything after must shift)
- Grows automatically when full (often doubles capacity)

**LearnCpp 21.2 example:**

```cpp
#include <vector>
#include <iostream>

int main()
{
    std::vector<int> vect;
    for (int count=0; count < 6; ++count)
        vect.push_back(10 - count);   // insert at end

    for (int index=0; index < vect.size(); ++index)
        std::cout << vect[index] << ' ';
    std::cout << '\n';
}
// Output: 10 9 8 7 6 5
```

**Klefstad PPT slide 6 (with explicit O(1) emphasis):**

```cpp
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> v;   // or vector<int> v2(100, 0);  with 100 elements init to zero
    for (int i = 0; i < 100; ++i)  // fill v
        v.push_back(i);            // appends to end of v
    for (int i = 0; i < v.size(); ++i)   // print v
        cout << v[i] << endl;
    for (; v.size() > 0; v.pop_back())   // drain v from the back
        cout << v.back() << endl;
}
```

> 💡 **PPT Note** — "elements are kept in a dynamic array — like Python list"
> - `push_back()`, `pop_back()`, `back()` are all O(1)
> - `v[i]` is fast (random access)

**Constructors worth knowing:**

```cpp
std::vector<int> v1;                  // empty
std::vector<int> v2(100);             // 100 default-initialized ints (= 0)
std::vector<int> v3(100, 7);          // 100 copies of 7
std::vector<int> v4{1, 2, 3, 4};      // initializer-list: exactly these 4 elements
std::vector<int> v5(v1.begin(), v1.end()); // copy from a range
```

> ⚠️ **Confusion alert** — `std::vector<int> v(100)` makes a vector of **100 zeros**, while `std::vector<int> v{100}` makes a vector containing **one element with value 100**. The brace-list constructor always wins when it can match.

#### 5.1.1 `size` vs `capacity` (cppreference)

A vector tracks **two different quantities**:

| Quantity | Meaning | Member |
|---|---|---|
| **size** | how many elements are *currently* in the vector | `v.size()` |
| **capacity** | how many elements the *currently allocated storage* could hold without reallocating | `v.capacity()` |

`size <= capacity` always. The gap exists because growth is **amortized O(1)**: when the vector runs out of capacity, it allocates a bigger buffer (typically doubling), copies/moves the existing elements over, and frees the old buffer. Reallocation is expensive, so the vector overshoots — pre-allocating extra room means subsequent `push_back`s are free.

> 💡 **cppreference exact wording (paraphrased)** — "Vectors usually occupy more space than static arrays, because more memory is allocated to handle future growth. This way a vector does not need to reallocate each time an element is inserted, but only when the additional memory is exhausted."

Two performance-relevant member functions:

```cpp
v.reserve(1000);     // bumps capacity to ≥ 1000 without changing size
                     // — use when you know roughly how many push_backs are coming
v.shrink_to_fit();   // requests that capacity shrink to size
                     // — non-binding; implementation may ignore it
```

> ⚠️ **Best practice** — Use `reserve()` before a big loop of `push_back`s when you know (or can estimate) the final size. It eliminates **all** reallocations and the associated iterator/pointer invalidations.

#### 5.1.2 Complexity Summary (cppreference)

| Operation | Complexity |
|---|---|
| Random access (`v[i]`, `v.at(i)`) | O(1) |
| Insert/remove at the end (`push_back`, `pop_back`) | amortized O(1) |
| Insert/remove in the middle (`insert`, `erase`) | O(n) — distance to end of vector |

#### 5.1.3 Member Function Map (cppreference)

| Category | Functions |
|---|---|
| **Element access** | `at(i)` (bounds-checked, throws), `operator[](i)` (no check, fastest), `front()`, `back()`, `data()` (raw pointer) |
| **Iterators** | `begin`/`end`, `cbegin`/`cend`, `rbegin`/`rend`, `crbegin`/`crend` |
| **Capacity** | `empty`, `size`, `max_size`, `reserve`, `capacity`, `shrink_to_fit` |
| **Modifiers (back)** | `push_back`, `emplace_back` (C++11), `pop_back` |
| **Modifiers (anywhere)** | `insert`, `emplace` (C++11), `erase`, `clear`, `resize`, `swap`, `assign` |

> 💡 **`at()` vs `operator[]`** — Both index into the vector. The difference: `v.at(i)` throws `std::out_of_range` if `i` is invalid; `v[i]` is **undefined behavior** for invalid `i`. Use `at()` when you can't guarantee the index is valid; use `[]` in tight inner loops.

> 💡 **`push_back` vs `emplace_back`** — `push_back(x)` takes an already-constructed object and *copies* (or moves) it in. `emplace_back(args...)` forwards the args to the element's constructor, constructing it **in place** with no temporary. For trivially-copyable types like `int`, no difference. For expensive types (a `std::string` or your own class), `emplace_back` saves a move.

#### 5.1.4 Iterator Invalidation (cppreference — critical knowledge)

This is the single most important table to memorize about `std::vector`. **Modifying a vector can invalidate iterators (and pointers/references) into it** — using one after invalidation is undefined behavior.

| Operation | Invalidates |
|---|---|
| All read-only operations | Nothing |
| `swap`, `std::swap` | only `end()` |
| `clear`, `operator=`, `assign` | **Always — all iterators** |
| `reserve`, `shrink_to_fit` | If capacity changed → all. If not → none. |
| `erase` | the erased element(s) and **all elements after them** (including `end()`) |
| `push_back`, `emplace_back` | If capacity grew → all. If not → only `end()`. |
| `insert`, `emplace` | If capacity grew → all. If not → only at and after the insertion point. |
| `resize` | If capacity grew → all. If not → only `end()` and any erased. |
| `pop_back` | The erased element and `end()`. |

> ⚠️ **The classic bug**
> ```cpp
> for (auto it = v.begin(); it != v.end(); ++it)
>     if (*it == bad)
>         v.erase(it);    // ⚠️ it is invalidated after erase!
> ```
> Fix with the **erase-return idiom**: `it = v.erase(it);` (and don't `++it` in the increment when you erased). Or use `std::erase` / `std::erase_if` (C++20).

#### 5.1.5 The `vector<bool>` Specialization (cppreference)

> ⚠️ **The standard library provides a specialization of `std::vector` for the type `bool`, which may be optimized for space efficiency.** This is *not* a real `vector` of `bool` — it's packed bits, and `v[i]` returns a **proxy object**, not a real `bool&`. Many things that work on `vector<int>` don't compile on `vector<bool>` (you can't take a `bool*` to an element, you can't use it with some generic algorithms).

If you need a sequence of booleans that behaves like a regular vector, use `std::vector<char>` or `std::deque<bool>`. If you need a bitset, `std::bitset<N>` (fixed-size) or `std::vector<bool>` (dynamic) is fine — just know what you're getting.

#### 5.1.6 cppreference Worked Example

```cpp
#include <iostream>
#include <vector>

int main()
{
    std::vector<int> v = {8, 4, 5, 9};
    v.push_back(6);
    v.push_back(9);
    v[2] = -1;              // overwrite element at position 2

    for (int n : v)
        std::cout << n << ' ';
    std::cout << '\n';
}
// Output: 8 4 -1 9 6 9
```


### 5.2 `std::deque` (double-ended queue, pronounced "deck")

A dynamic array-like container that supports fast push/pop at **both ends**.

**Defining characteristics:**

- O(1) push/pop at **both** front and back
- Random access via `operator[]` is O(1) but slower than `vector` (the storage is typically a sequence of fixed-size blocks, not one contiguous chunk)
- Insertion/removal in the middle is O(n)

```cpp
#include <iostream>
#include <deque>

int main()
{
    std::deque<int> deq;
    for (int count=0; count < 3; ++count)
    {
        deq.push_back(count);       // insert at back
        deq.push_front(10 - count); // insert at front
    }

    for (int index=0; index < deq.size(); ++index)
        std::cout << deq[index] << ' ';
    std::cout << '\n';
}
// Output: 8 9 10 0 1 2
```

### 5.3 `std::list` (doubly linked list) and `std::forward_list` (singly linked)

A **doubly linked list** where each node has `prev`, `next`, and the element value. `std::forward_list` is the singly linked variant introduced in C++11 (only `next`, more memory-efficient, only forward iteration).

**Defining characteristics:**

- **No random access** — no `operator[]`, no `at()`. To reach element *i* you must walk the list (O(n)).
- O(1) insertion or removal **anywhere**, **given an iterator to the spot**
- Iterators stay valid after insertion/erasure elsewhere (vector iterators don't)

> LearnCpp 21.2: "Lists only provide access to the start and end of the list — there is no random access provided. If you want to find a value in the middle, you have to start at one end and 'walk the list' until you reach the element you want to find."

Use `list` when you do a lot of middle-insertion/removal and don't need random access.

### 5.4 `std::array` (C++11, simple C-array wrapper)

A **fixed-size** array whose size is part of the type. Essentially a safer, STL-compatible replacement for C-style arrays.

```cpp
std::array<int, 5> a{1, 2, 3, 4, 5};  // size 5 is part of the type
```

**Defining characteristics:**

- Size known at compile time, no dynamic allocation
- Random access in O(1)
- Has STL iterators (`begin()`, `end()`), so it works with `std::sort`, `std::find`, etc.
- Cannot grow or shrink

### 5.5 `std::string` as a sequence container

Although LearnCpp notes `string` isn't *generally* lumped with sequence containers, **it essentially is one**: it behaves like a `vector<char>` with extra string-specific helpers (`+`, `substr`, `find`, etc.). It exposes the same iterator interface, so STL algorithms work on strings unchanged.

```cpp
std::string s = "world";
std::reverse(s.begin(), s.end());  // s == "dlrow"
```

---

## 6. Associative Containers

> Corresponds to LearnCpp 21.2 (associative containers) + Topic 8 PPT slides 7–10

Associative containers **sort** (or hash) their elements automatically on insertion. You don't decide the position — the container does.

**Default comparison:** `operator<`. You can supply a custom comparator.

### 6.1 `std::set` and `std::multiset`

**`set`** — a collection of **unique** elements sorted by value.
**`multiset`** — same, but duplicates are allowed.

**Operations and complexity (all O(log n) for the balanced-BST versions):**

- `insert(x)` — add x; for `set`, no-op if already present
- `find(x)` — returns an iterator to x, or `end()` if absent
- `erase(x)` or `erase(iter)` — remove
- iteration yields elements in **sorted order**

**Klefstad PPT slide 8 example:**

```cpp
#include <iostream>
#include <set>
using namespace std;

int main() {
    set<char> S;
    for (char c = 'A'; c <= 'Z'; ++c)   // fill S
        S.insert(c);
    for (char c = 'Z'; c >= 'A'; --c)   // fill S again
        S.insert(c);                    // duplicates are silently rejected
    for (auto E : S)
        cout << E << endl;              // each letter appears exactly once

    if (S.find('A') != S.end())
        cout << "A is in there" << endl;
}
```

If `S` were a `multiset` instead, you would see `A A B B C C ... Z Z` because each letter was inserted twice.

> 💡 **Conceptual Note**
> `std::set` is **not** a Python set. Python's `set` is a hash table (unordered, O(1) lookup). C++'s `std::set` is a **balanced binary search tree** (sorted, O(log n) lookup). The hash version is `std::unordered_set`.

#### 6.1.1 Implementation and Uniqueness Rule (cppreference)

> 💡 **cppreference (paraphrased)** — `std::set` contains a *sorted set of unique objects of type Key*. Search, removal, and insertion are **logarithmic**. Sets are **usually implemented as red–black trees** — a self-balancing binary search tree.

**Uniqueness is defined via equivalence, not equality:**

Two elements `a` and `b` are considered "the same" (and only one is kept in the set) when:

```
!comp(a, b) && !comp(b, a)
```

In plain English: neither is *strictly less than* the other under the comparison function. The default `comp` is `std::less<Key>`, which uses `operator<`.

> ⚠️ **Subtle implication** — `std::set` *never* calls `operator==`. It only calls `operator<`. So a type that has a weird `<` and a normal `==` can produce surprising "duplicates" or "non-duplicates" in a set.

#### 6.1.2 Member Function Map (cppreference)

| Category | Functions |
|---|---|
| **Iterators** | `begin`/`end`, `cbegin`/`cend`, `rbegin`/`rend`, `crbegin`/`crend` |
| **Capacity** | `empty`, `size`, `max_size` |
| **Modifiers** | `clear`, `insert`, `emplace` (C++11), `emplace_hint` (C++11), `erase`, `swap`, `extract` (C++17), `merge` (C++17) |
| **Lookup** | `count`, `find`, `contains` (C++20), `equal_range`, `lower_bound`, `upper_bound` |
| **Observers** | `key_comp`, `value_comp` (returns the comparison function) |

> 💡 **`contains` (C++20)** is the modern idiomatic membership check:
> ```cpp
> if (s.contains(x))  { /* ... */ }   // C++20
> if (s.find(x) != s.end()) { /* ... */ }   // pre-C++20 equivalent
> ```

> 💡 **`count` on `set` returns 0 or 1** (because keys are unique). On `multiset` it can be larger. Either way, `count(x) > 0` is a less efficient way to check membership than `contains(x)` — the latter can short-circuit on the first match.

#### 6.1.3 Range Queries — `lower_bound`, `upper_bound`, `equal_range`

These three return iterators into the *sorted* set, useful for range queries:

| Function | Returns iterator to … |
|---|---|
| `s.lower_bound(k)` | first element **not less than** `k` (i.e. ≥ k) |
| `s.upper_bound(k)` | first element **strictly greater than** `k` (i.e. > k) |
| `s.equal_range(k)` | a `pair<iterator, iterator>` equivalent to `{lower_bound(k), upper_bound(k)}` |

In a `multiset` `[1, 2, 2, 2, 3]`:
- `lower_bound(2)` → iterator to the first `2`
- `upper_bound(2)` → iterator to `3`
- Iterating between them visits all the `2`s.

#### 6.1.4 cppreference Worked Example

```cpp
#include <iostream>
#include <set>
#include <string_view>

int main() {
    std::set<int> set{1, 5, 3};
    // set: { 1, 3, 5 }  — automatically sorted on construction

    set.insert(2);
    // set: { 1, 2, 3, 5 }

    set.erase(1);
    // set: { 2, 3, 5 }

    // C++20 contains
    if (set.contains(3))
        std::cout << "set contains 3\n";

    // Range-constructor from any iterable
    std::string_view word = "element";
    std::set<char> characters(word.begin(), word.end());
    // characters: { e, l, m, n, t }   — 5 unique characters
}
```

> 💡 **Range constructor idiom** — every STL container accepts a `(begin, end)` iterator pair, so you can build a `set<char>` from a `string`, a `set<int>` from a `vector<int>`, etc.

### 6.2 `std::map` and `std::multimap`

**`map`** — a collection of **key/value pairs**, sorted by key, with **unique keys**.
**`multimap`** — same, but multiple values per key are allowed.

Each element is a `std::pair<const Key, Value>`, accessed via `.first` (the key) and `.second` (the value).

> **Klefstad PPT slide 9** — "elements are `pair<first, second>` like `pair<key, value>` — behave like an array but indexed by any type (like Python Dictionary). Elements are sorted by their `first` (not `second`)."

**Multimap as a dictionary:** A real-world dictionary maps a word (key) to one or more meanings (values). That's a `multimap`, not a `map`.

**LearnCpp 21.3 example:**

```cpp
#include <map>
#include <string>
#include <iostream>

int main() {
    std::map<int, std::string> mymap;
    mymap.insert(std::make_pair(4, "apple"));
    mymap.insert(std::make_pair(2, "orange"));
    mymap.insert(std::make_pair(1, "banana"));
    mymap.insert(std::make_pair(3, "grapes"));
    mymap.insert(std::make_pair(6, "mango"));
    mymap.insert(std::make_pair(5, "peach"));

    auto it{ mymap.cbegin() };
    while (it != mymap.cend()) {
        std::cout << it->first << '=' << it->second << ' ';
        ++it;
    }
    std::cout << '\n';
}
// Output: 1=banana 2=orange 3=grapes 4=apple 5=peach 6=mango
```

**Klefstad PPT slide 10 — three ways to iterate:**

```cpp
#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    map<string, int> A;
    A["Bill"]   = 33;
    A["George"] = 29;
    A["Al"]     = 27;

    // Way 1: classic for-each, E is a pair<string,int>
    for (auto E : A)
        cout << E.first << " is " << E.second << " ";

    // Way 2: C++17 "destructuring for loop" — by const reference (no copy)
    for (const auto& [name, age] : A)
        cout << name << " is " << age << " ";

    // Both print: Al is 27 Bill is 33 George is 29
}
```

> 💡 **Key Insight** — `map` is sorted on the **first** field, so iterating prints keys in ascending order: `Al`, `Bill`, `George`.

**The bracket operator on `map`:**

```cpp
A["Bill"] = 33;   // insert or overwrite key "Bill" with value 33
int x = A["Al"];  // read the value at key "Al"
```

> ⚠️ **Trap** — `A["NewKey"]` on a non-existent key **inserts** a new entry with a default-constructed value (0 for `int`, `""` for `string`) and returns a reference to it. To check existence without inserting, use `A.find(key) != A.end()` or (C++20) `A.contains(key)`.

#### 6.2.1 Implementation and Sort Order (cppreference)

> 💡 **cppreference (paraphrased)** — `std::map` is a *sorted associative container that contains key-value pairs with unique keys*. Search, removal, and insertion are **logarithmic**. Maps are **usually implemented as red–black trees**.

Iterators visit the elements **in ascending order of keys** (using the comparison function — `std::less<Key>` by default).

Uniqueness rule, like `set`, is **equivalence-based**: keys `a` and `b` are considered the same if `!comp(a, b) && !comp(b, a)`.

#### 6.2.2 `value_type = std::pair<const Key, T>` (cppreference)

A subtle but crucial detail: each element of a `map<Key, T>` is a

```
std::pair<const Key, T>
```

— note the `const` on `Key`. You cannot modify a key in place after insertion (modifying it would break the sort order). To "change" a key, you must `erase` the old entry and `insert` a new one.

Three useful type aliases you'll see:

| Alias | Type |
|---|---|
| `key_type` | `Key` |
| `mapped_type` | `T` |
| `value_type` | `std::pair<const Key, T>` |

#### 6.2.3 Element Access: `at()` vs `operator[]`

| Operation | Behavior on existing key | Behavior on missing key |
|---|---|---|
| `m.at(k)` | returns reference to the value | **throws `std::out_of_range`** |
| `m[k]` | returns reference to the value | **inserts** `{k, T{}}` and returns a reference to the new value |

> ⚠️ **Three implications:**
> - You **cannot** use `operator[]` on a `const map` — it might insert!
> - You **cannot** use `operator[]` if `T` has no default constructor.
> - `m[k]` is a *write* even if you wrote `int x = m[k];` — it creates an entry. Use `m.find(k)`, `m.contains(k)` (C++20), or `m.at(k)` for read-only access.

#### 6.2.4 Member Function Map (cppreference)

| Category | Functions |
|---|---|
| **Element access** | `at(k)` (throws), `operator[](k)` (inserts on miss) |
| **Iterators** | `begin`/`end`, `cbegin`/`cend`, `rbegin`/`rend`, `crbegin`/`crend` |
| **Capacity** | `empty`, `size`, `max_size` |
| **Modifiers** | `clear`, `insert`, `insert_or_assign` (C++17), `emplace` (C++11), `emplace_hint`, `try_emplace` (C++17), `erase`, `swap`, `extract` (C++17), `merge` (C++17) |
| **Lookup** | `count`, `find`, `contains` (C++20), `equal_range`, `lower_bound`, `upper_bound` |
| **Observers** | `key_comp`, `value_comp` |

**Three insert variants worth knowing (C++17):**

| Method | If key exists | If key missing |
|---|---|---|
| `insert({k, v})` | does **nothing** (returns iterator + `false`) | inserts |
| `insert_or_assign(k, v)` | **overwrites** value | inserts |
| `try_emplace(k, args...)` | does **nothing** (returns iterator + `false`); **does not even construct the value** | constructs value in place |

> 💡 **Why `try_emplace`?** Suppose `T` is expensive to construct (e.g. a big `std::string` built from a function call). `insert({k, expensive_construct()})` always constructs the value, even if it then throws it away because `k` already existed. `try_emplace(k, args_for_construct...)` only constructs when needed.

#### 6.2.5 cppreference Worked Example

```cpp
#include <iostream>
#include <map>
#include <string>

void print_map(std::string_view label, const std::map<std::string, int>& m) {
    std::cout << label;
    for (const auto& [key, value] : m)        // C++17 structured binding
        std::cout << '[' << key << "] = " << value << "; ";
    std::cout << '\n';
}

int main() {
    // List-initialization with brace-pair entries
    std::map<std::string, int> m{{"CPU", 10}, {"GPU", 15}, {"RAM", 20}};
    print_map("1) Initial:  ", m);
    // 1) Initial:  [CPU] = 10; [GPU] = 15; [RAM] = 20;

    m["CPU"] = 25;   // update existing
    m["SSD"] = 30;   // insert new
    print_map("2) Updated:  ", m);
    // 2) Updated:  [CPU] = 25; [GPU] = 15; [RAM] = 20; [SSD] = 30;

    // ⚠️ operator[] on a NON-EXISTENT key inserts default value (0 for int)
    std::cout << "3) m[UPS] = " << m["UPS"] << '\n';
    // 3) m[UPS] = 0
    // m now contains UPS=0 even though we only "read" it!

    m.erase("GPU");
    print_map("4) After erase: ", m);

    // C++20: erase_if free function
    std::erase_if(m, [](const auto& pair){ return pair.second > 25; });
    print_map("5) After erase_if (>25): ", m);

    std::cout << "size = " << m.size() << '\n';
    m.clear();
    std::cout << std::boolalpha << "empty? " << m.empty() << '\n';
}
```

> 💡 **List initialization syntax** — `{{"CPU", 10}, {"GPU", 15}}` is two brace-init-lists, each constructing a `pair<string, int>`, packaged in an outer `initializer_list<pair>` consumed by the map's constructor. You'll see this constantly.

### 6.3 `std::unordered_set` and `std::unordered_map`

The **hash-table** versions, added in C++11.

- Average O(1) `insert`, `find`, `erase` (versus O(log n) for the ordered versions)
- Elements are **not** in any meaningful order
- Use when you don't need sorted iteration and want speed

### 6.4 Quick Comparison Table

| Container | Ordering | Unique keys | Lookup |
|---|---|---|---|
| `set` | sorted | yes | O(log n) |
| `multiset` | sorted | duplicates allowed | O(log n) |
| `unordered_set` | hashed (none) | yes | O(1) avg |
| `map` | sorted by key | yes | O(log n) |
| `multimap` | sorted by key | duplicates allowed | O(log n) |
| `unordered_map` | hashed (none) | yes | O(1) avg |

---

## 7. Container Adapters

> Corresponds to LearnCpp 21.2 (container adapters) + Topic 8 PPT slide 23

Container adapters are **wrappers** around an existing sequence container; they expose a **restricted** interface that matches a specific abstract data type. You can choose which underlying container to wrap (and there's a sensible default).

### 7.1 `std::stack` — LIFO

A **stack** is a Last-In, First-Out container.

```cpp
#include <stack>
std::stack<int> s;
s.push(1);
s.push(2);
s.push(3);
int top = s.top();   // 3
s.pop();             // removes 3
```

**Klefstad PPT slide 23 — backing container requirements:**

> Works with any container that supports `empty`, `size`, `back`, `push_back`, `pop_back`.
> Compatible underlyings: `vector`, `deque`, `list`. **Default: `deque`.**

> 💡 **PPT Note** — "default is `deque` (which seems odd, since vector seems like a more natural fit)." This is a historical/efficiency choice — `deque` avoids the periodic reallocation cost of `vector::push_back` when capacity is exceeded.

### 7.2 `std::queue` — FIFO

A **queue** is First-In, First-Out: insert at the back, remove from the front.

```cpp
#include <queue>
std::queue<int> q;
q.push(1);
q.push(2);
int front = q.front();   // 1
q.pop();                 // removes 1
```

**Backing container requirements:** supports `empty`, `size`, `front`, `back`, `push_back`, `pop_front`.
Compatible underlyings: `deque`, `list`. **Default: `deque`.**

> ⚠️ **Why not `vector` for `queue`?** Because `vector` has no `pop_front` — removing from the front would be O(n).

### 7.3 `std::priority_queue` — sorted queue

A queue where elements are kept in sorted order (by `operator<` by default). Popping always returns the **highest-priority** element.

```cpp
#include <queue>
std::priority_queue<int> pq;
pq.push(3); pq.push(1); pq.push(7); pq.push(4);
int big = pq.top();   // 7
pq.pop();
```

**Compatible underlyings:** `vector`, `deque`. **Default: `vector`.**

It is internally implemented as a **binary heap**, giving:

- `push` — O(log n)
- `pop` — O(log n)
- `top` — O(1)

---

## 8. Matching Tasks to Containers (Klefstad Activity)

> Corresponds to Topic 8 PPT slide 5 (activity)

Klefstad's slide poses an exercise: pick the right STL container family (`Set`, `Map`, `Vector`) for each task. Here is one reasonable matching with justification — these are the kind of distinctions that the course wants you to be quick about:

| # | Task | Best container | Why |
|---|---|---|---|
| 1 | Contact/address list (each person → their info) | **Map** (`map<Name, Address>`) | Indexed by a unique key, value is structured data |
| 2 | A sequence of HW scores | **Vector** | Order matters (HW1, HW2, …); appending is common |
| 3 | A roster of students (unique names, no extra data) | **Set** | Membership only, must be unique |
| 4 | Stopwords (a fixed list of words to ignore) | **Set** | Fast `find()`, no duplicates, no value to attach |
| 5 | Counting word frequency | **Map** (`map<string, int>`) | Word → count |
| 6 | A char string | **Vector** (or `string`) | Contiguous, indexed by position |
| 7 | Prime numbers < 1000 | **Vector** (or **Set** if `find` is the dominant op) | If iterating, vector wins on cache; if testing membership, set wins |

> ⚠️ **The general rule of thumb**
> - **Vector** when you mostly *iterate*, *append*, or *index by position*
> - **Map** when you look things up *by a key* and want to associate a *value*
> - **Set** when you only need *membership* (or sorted unique elements)
> - **Unordered\_** versions when you don't need sorted iteration

---

## 9. STL Iterators

> Corresponds to LearnCpp 21.3 + Topic 8 PPT slides 11–13

### 9.1 What is an Iterator?

An **iterator** is an object that traverses a container without exposing how the container is implemented. Think of it as a **smart pointer** that knows how to "move to the next element" in whatever data structure it lives in.

Why iterators matter — quoting LearnCpp 21.3 with course-relevant emphasis:

> With many classes (particularly lists and the associative classes), iterators are the **primary way** elements are accessed.

You can't write `myList[5]` on a `std::list`. You can write `*it` on an iterator that points into the list. The same expression works for a vector iterator, a set iterator, or a map iterator.

> 💡 **Key Insight**
> An iterator is best visualized as a **pointer to an element** in the container, with overloaded operators that mimic pointer arithmetic but actually do whatever traversal makes sense for that container.

### 9.2 Iterator Operations (the Five Big Ones)

From Topic 8 PPT slide 12 + LearnCpp 21.3:

| Operator | Meaning |
|---|---|
| `*it` | **Dereference** — returns the element the iterator points at |
| `it->member` | Member selection — equivalent to `(*it).member`. Useful for `pair` access in maps (`it->first`, `it->second`) |
| `++it` | **Advance** to the next element |
| `--it` | Retreat to the previous element (only on bidirectional iterators and above) |
| `it1 == it2` / `it1 != it2` | Compare two iterators for **position equality** (not value!) |
| `it = other` | **Assign** an iterator to a new position |

> ⚠️ **Subtle but critical** — comparing two iterators with `==` checks **whether they point to the same position**, not whether the elements have the same value. To compare values, dereference first: `*it1 == *it2`.

### 9.3 `begin()`, `end()`, `cbegin()`, `cend()`

Every container exposes four basic member functions for getting iterators:

| Function | Returns |
|---|---|
| `c.begin()` | iterator to the **first** element |
| `c.end()`   | iterator to **one past the last** element (the "sentinel") |
| `c.cbegin()`| **const** iterator (read-only) to the first element |
| `c.cend()`  | **const** iterator to one past the last |

> 💡 **Key Insight — The Half-Open Range `[begin, end)`**
> `end()` does **not** point at the last element; it points one past it. This is intentional:
> ```cpp
> for (auto it = c.begin(); it != c.end(); ++it) { ... }
> ```
> The loop is cleanest when the termination test is `it != end()`. If `end()` pointed to the last element, you would need `<=` (which iterators don't support generically) and special-case the empty container.

### 9.4 Iterating Through Different Containers

The four examples from LearnCpp 21.3 demonstrate the **uniformity** of the iterator interface:

**Vector:**

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> vect;
    for (int count = 0; count < 6; ++count)
        vect.push_back(count);

    std::vector<int>::const_iterator it;
    it = vect.cbegin();
    while (it != vect.cend()) {
        std::cout << *it << ' ';
        ++it;
    }
    std::cout << '\n';
}
// 0 1 2 3 4 5
```

**List** — *identical loop, different container:*

```cpp
#include <list>
std::list<int> li;
for (int count = 0; count < 6; ++count)
    li.push_back(count);

std::list<int>::const_iterator it;
it = li.cbegin();
while (it != li.cend()) {
    std::cout << *it << ' ';
    ++it;
}
// 0 1 2 3 4 5
```

> 💡 **The whole point of iterators** — "Note the code is almost identical to the vector case, even though vectors and lists have almost completely different internal implementations!" (LearnCpp 21.3)

**Set** — same loop again, but the **output order is sorted**, because sets sort on insertion:

```cpp
#include <set>
std::set<int> myset;
myset.insert(7); myset.insert(2); myset.insert(-6);
myset.insert(8); myset.insert(1); myset.insert(-4);

auto it = myset.cbegin();
while (it != myset.cend()) {
    std::cout << *it << ' ';
    ++it;
}
// -6 -4 1 2 7 8   (sorted!)
```

**Map** — slight twist: each `*it` is a `std::pair`, so use `it->first` and `it->second`:

```cpp
std::map<int, std::string> mymap;
mymap.insert(std::make_pair(4, "apple"));
// ...etc

auto it{ mymap.cbegin() };
while (it != mymap.cend()) {
    std::cout << it->first << '=' << it->second << ' ';
    ++it;
}
// 1=banana 2=orange 3=grapes 4=apple 5=peach 6=mango
```

### 9.5 Range-Based for Loop (the Modern Idiom)

The four loops above can all be written with the range-based `for`, which is **iterator-driven under the hood**:

```cpp
for (auto e : V)           // copy each element
    std::cout << e;

for (const auto& E : V)    // reference (no copy) to each element
    std::cout << E;
```

Per Topic 8 PPT slide 12:
- `auto e : V` — `e` is a **copy** of each element
- `auto const& E : V` — `E` is a **const reference** (no copy, can't modify)
- `auto& E : V` — non-const reference (can modify)

> ⚠️ **Best practice** — for non-trivial element types (strings, structs, etc.), prefer `const auto&` to avoid silently copying every element of the container.

### 9.6 Custom Iterator: A Linked List Iterator (PPT slide 13)

Klefstad walks through what an iterator looks like for a linked list. This is the **conceptual blueprint** for writing your own iterators (relevant if HW7+ involves making a container iterable).

The PPT setup:

```cpp
struct Node { char data; Node * next; };

struct List {
    Node *head;
    struct iterator { /* see below */ };
    iterator begin();
    iterator end();
    // ...
};
```

**Three equivalent ways to walk the list:**

```cpp
List L;

// 1. Manual pointer walk (no STL)
for (Node *p = L.head; p != nullptr; p = p->next)
    std::cout << p->data;

// 2. STL iterator style
for (List::iterator it = L.begin(); it != L.end(); ++it)
    std::cout << (*it).data;

// 3. Range-based for (requires begin/end + iterator operators)
for (auto e : L)
    std::cout << e;
```

**The iterator class itself** holds a node pointer and overloads the right operators:

```cpp
struct List::iterator {
    Node * ptr;
    auto operator*()  -> char&  { return ptr->data; }
    auto operator->() -> Node*  { return ptr; }
    auto operator++() -> iterator& { ptr = ptr->next; return *this; }
    bool operator==(const iterator& other) const { return ptr == other.ptr; }
    bool operator!=(const iterator& other) const { return ptr != other.ptr; }
};
```

And `List::begin()` returns `iterator{head}`; `List::end()` returns `iterator{nullptr}`.

> 💡 **Key Insight**
> Iterators are **per-class** — every container has to write its own, because the iterator needs to know the data structure's traversal logic. The genius of STL is that **algorithms** don't have to know this; they only see the iterator interface.

---

## 10. Iterator Categories

> Corresponds to Topic 8 PPT slide 21

STL iterators come in a **hierarchy of capabilities**. Each category supports a strict superset of the previous category's operations. Algorithms specify the **minimum** category they need, which determines which containers they can work with.

| Category | Capabilities | Example containers |
|---|---|---|
| **Input iterator** | read once, advance forward (`*it`, `++it`); single-pass | `istream_iterator` |
| **Output iterator** | write once, advance forward; single-pass | `ostream_iterator`, `back_inserter` |
| **Forward iterator** | input + output, multi-pass forward | `forward_list` |
| **Bidirectional iterator** | forward + `--it` | `list`, `set`, `multiset`, `map`, `multimap` |
| **Random-access iterator** | bidirectional + `it + n`, `it[n]`, `it1 - it2`, ordering (`<`, `>`) | `vector`, `deque`, `string` |
| **Contiguous iterator** (C++17) | random-access + **logically adjacent = physically adjacent** | `array`, `string`, `vector` |

> 💡 **PPT Note (slide 21)** — "These perform well on modern architectures with cache." Contiguous iterators are *the* reason `vector` is so often faster than `list` in practice, even when complexity analysis says they should be equal: cache prefetching turns contiguous traversal into a near-free operation.

> ⚠️ **Practical implications**
> - `std::sort` requires **random-access iterators** → works on `vector`, `deque`, `array`, `string`, but **not** on `list` or `set`. `std::list` provides its own member `.sort()` instead.
> - `std::binary_search` requires **forward iterators** (and a sorted range)
> - Algorithms that only need to walk once (`std::find`, `std::accumulate`, `std::copy`) work with **input iterators** — so they also work on streams

---

## 11. STL Algorithms

> Corresponds to LearnCpp 21.4 + Topic 8 PPT slides 14–15

### 11.1 Overview

> 💡 **The big idea (LearnCpp 21.4)**
> Algorithms are implemented as **functions that operate using iterators**. Each algorithm is written **once** and works for every container that provides matching iterators — including your own. This is what makes STL composable.

To use any STL algorithm, include `<algorithm>`. Numeric algorithms (`std::accumulate`, `std::iota`) live in `<numeric>`.

> ⚠️ **Warning (LearnCpp 21.4)** — Some combinations of algorithms and containers may not work, may infinite-loop, or may be wildly inefficient. Most notably:
> - `std::sort` on a `std::list` is a **compile error** (list iterators aren't random-access)
> - But `list.sort()` (a member function) exists and is efficient
> - Don't pass invalid iterator pairs (`end` before `begin`) — undefined behavior

### 11.2 Searching and Min/Max

**`min_element` / `max_element` / `iota` (PPT slide 15 + LearnCpp 21.4):**

```cpp
#include <algorithm>   // min_element, max_element
#include <iostream>
#include <list>
#include <numeric>     // iota

int main() {
    std::list<int> li(6);
    std::iota(li.begin(), li.end(), 0);   // fills with 0,1,2,3,4,5

    std::cout << *std::min_element(li.begin(), li.end()) << ' '
              << *std::max_element(li.begin(), li.end()) << '\n';
    return 0;
}
// Output: 0 5
```

> 💡 **What `iota` does**
> `iota(begin, end, start)` fills a range with consecutive values starting from `start`: `start, start+1, start+2, ...`. Named after the Greek letter ι (used in APL for the same operation).

**`find` (LearnCpp 21.4 + PPT slide 15):**

```cpp
std::list<int> li(6);
std::iota(li.begin(), li.end(), 0);
auto it = std::find(li.begin(), li.end(), 3);   // returns iterator to 3
li.insert(it, 8);                               // insert 8 just before 3
for (int i : li) std::cout << i << ' ';
// Output: 0 1 2 8 3 4 5
```

> ⚠️ **Critical idiom — checking find's return value:**
> When the searched value isn't found, `find` returns the `end` iterator. Always check before dereferencing:
> ```cpp
> if (it == li.end()) { std::cout << "not found\n"; }
> else                { /* safe to use *it or it */ }
> ```

### 11.3 Sorting and Reversing

```cpp
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> vect{ 7, -3, 6, 2, -5, 0, 4 };

    std::sort(vect.begin(), vect.end());
    // vect: -5 -3 0 2 4 6 7

    std::reverse(vect.begin(), vect.end());
    // vect: 7 6 4 2 0 -3 -5
}
```

**Sorting in reverse with a comparator:**

```cpp
#include <functional>
std::sort(vect.begin(), vect.end(), std::greater<int>{});
// Or with a lambda:
std::sort(vect.begin(), vect.end(), [](int a, int b){ return a > b; });
```

> ⚠️ **Klefstad warning** — `std::sort` does **NOT** work on `std::list`. The list iterator is bidirectional, not random-access. Use `myList.sort()` (the member function) instead — it is also asymptotically faster on lists because it can rearrange links instead of moving elements.

### 11.4 Reverse Mid-Range, accumulate, transform (PPT slide 15)

Topic 8 PPT slide 15 shows a richer algorithm demo than LearnCpp 21.4. Worth memorizing:

```cpp
#include <algorithm>
#include <numeric>
#include <vector>
#include <iostream>
using namespace std;

int main() {
    vector<int> V{2, 5, 4, 1, 6, 3};

    auto pos = min_element(V.begin(), V.end());
    cout << "Min = " << *pos << endl;        // returns iterator to V[3] (= 1)

    sort(V.begin(), V.end());                // V is {1, 2, 3, 4, 5, 6}

    pos = find(V.begin(), V.end(), 3);       // iterator to V[2]
    reverse(pos, V.end());                   // V is {1, 2, 6, 5, 4, 3}

    cout << "Total = " << accumulate(V.begin(), V.end(), 0) << endl;
    // prints Total = 21

    transform(V.begin(), V.end(), V.begin(),
              [](int i){ return i + 1; });
    // V is now {2, 3, 7, 6, 5, 4}
}
```

**Three new algorithms here:**

- **`accumulate(first, last, init)`** — sums the range starting from `init` (in `<numeric>`). The initial value's type determines the result type: `accumulate(v.begin(), v.end(), 0)` returns `int`; pass `0.0` for `double`.
- **`reverse(first, last)`** — reverses the range in place; can be applied to any **subrange** by passing iterators into the middle.
- **`transform(in_begin, in_end, out_begin, fn)`** — applies `fn` to each element of the input range, writing the result starting at `out_begin`. When `out_begin == in_begin`, the transform happens in place.

### 11.5 Other Common Algorithms (Reference)

| Algorithm | Purpose |
|---|---|
| `for_each(b, e, fn)` | Calls `fn(x)` on each element in `[b, e)` |
| `count(b, e, val)` | Returns how many times `val` appears |
| `count_if(b, e, pred)` | Counts elements satisfying predicate |
| `copy(b, e, dest)` | Copies range into `dest` |
| `unique(b, e)` | Removes adjacent duplicates (must sort first to remove all dups) |
| `unique_copy(b, e, dest)` | Copies range, skipping adjacent duplicates |
| `remove(b, e, val)` | "Removes" `val` (actually shifts; container size unchanged — see erase-remove idiom) |
| `binary_search(b, e, val)` | Returns `true` if `val` exists in a sorted range |
| `lower_bound(b, e, val)` | Iterator to first element ≥ val |
| `upper_bound(b, e, val)` | Iterator to first element > val |

---

## 12. Iterator Adapters

> Corresponds to Topic 8 PPT slides 16–18, 22

An **iterator adapter** is an iterator that wraps something else (a container insertion operation, a stream, or a forward iterator) and exposes the iterator interface — so the wrapped thing can be used anywhere an iterator is expected.

### 12.1 Insert Iterators — `back_inserter`, `front_inserter`, `inserter`

A regular iterator overwrites elements. An **insert iterator** *grows the container* by calling `push_back`, `push_front`, or `insert` on each assignment.

Without insert iterators, `copy` would write **off the end** of an empty destination — undefined behavior. With them, the destination grows to fit.

**PPT slide 16 — full example:**

```cpp
int main() {
    list<int> L;
    for (int i = 1; i <= 10; ++i)
        L.push_back(i);

    // back_inserter: each assignment calls V.push_back(...)
    vector<int> V;
    copy(L.begin(), L.end(),     // source
         back_inserter(V));       // destination

    // front_inserter: each assignment calls D.push_front(...)
    deque<int> D;
    copy(L.begin(), L.end(),
         front_inserter(D));

    // inserter: each assignment calls S.insert(hint, ...)
    // inserter works on associative containers too
    set<int> S;
    copy(begin(L), end(L),
         inserter(S, std::next(begin(S))));
}
```

| Adapter | Calls | Works on |
|---|---|---|
| `back_inserter(c)` | `c.push_back(x)` | containers with `push_back` (`vector`, `deque`, `list`, `string`) |
| `front_inserter(c)` | `c.push_front(x)` | containers with `push_front` (`deque`, `list`) |
| `inserter(c, pos)` | `c.insert(pos, x)` | any container with `insert`, including associative |

> ⚠️ **Pitfall** — there is no `back_inserter` for `set` or `map`, because associative containers decide position automatically. Use `inserter(s, s.end())` or simply `s.insert(x)`.

### 12.2 Stream Iterators — `istream_iterator` and `ostream_iterator`

A stream iterator turns `cin`, `cout`, `ifstream`, `ofstream` into an STL iterator range. This is what lets you `copy` straight from a file into a container, or `transform` straight from input to output.

**PPT slide 17 — read all words from cin into a vector, sort, print unique words:**

```cpp
#include <iostream>
#include <iterator>
#include <algorithm>
#include <vector>
#include <string>
using namespace std;

int main() {
    vector<string> V;
    copy(istream_iterator<string>(cin),   // start of source
         istream_iterator<string>(),       // end of source: default-ctor = EOF
         back_inserter(V));                // destination

    sort(begin(V), end(V));

    unique_copy(begin(V), end(V),
                ostream_iterator<string>(cout, "\n"));   // delimiter "\n" between writes
}
```

**Key idioms:**

- `istream_iterator<T>(stream)` — reads `T` values from `stream` via `>>`
- `istream_iterator<T>()` (default-constructed) — represents **end-of-stream** (EOF)
- `ostream_iterator<T>(stream, "delim")` — writes via `<<`, then writes `"delim"` after each value

**PPT slide 18 — same idea, with files:**

```cpp
#include <iostream>
#include <fstream>
#include <iterator>

int main() {
    ifstream in {"input.data"};
    ofstream out{"output.data"};

    vector<string> V;
    copy(istream_iterator<string>(in),
         istream_iterator<string>(),
         back_inserter(V));

    sort(V.begin(), V.end());

    unique_copy(V.begin(), V.end(),
                ostream_iterator<string>(out, "\n"));
}
```

> 💡 **Klefstad teaching point**
> The same algorithm (`copy`, `sort`, `unique_copy`) doesn't care that its iterators come from `cin`/`cout` vs. `ifstream`/`ofstream` vs. a `vector`. **This is the entire payoff of the STL design.**

**Activities from PPT slides 19–20:**

Fill a vector with integers from `cin`:

```cpp
int main() {
    vector<int> V;
    copy(istream_iterator<int>(cin), istream_iterator<int>(),
         back_inserter(V));
}
```

Print integers from a vector to `"out.txt"` one per line:

```cpp
int main() {
    vector<int> V = {0, 2, 4, 6, 8, 10};
    ofstream out{"out.txt"};
    copy(V.begin(), V.end(),
         ostream_iterator<int>(out, "\n"));
}
```

### 12.3 Reverse Iterators (PPT slide 22)

A **reverse iterator** swaps the meaning of `++` and `--`: incrementing actually moves you *backwards* through the container. Every container provides `rbegin()` and `rend()`.

```cpp
int main() {
    vector<int> V;
    for (int i = 1; i <= 10; ++i)
        V.push_back(i);

    // Print 10 9 8 ... 1
    copy(V.rbegin(), V.rend(),
         ostream_iterator<int>(cout, " "));
}
```

| Method | Returns | Direction |
|---|---|---|
| `begin()` | iterator to first | forward |
| `end()` | iterator one past last | forward |
| `rbegin()` | reverse iterator to last | reverse |
| `rend()` | reverse iterator one before first | reverse |

> ⚠️ **Conceptual trap** — `rbegin()` points to the **last** element (the start of the reverse traversal), not to `end() - 1` directly. It is a different *kind* of iterator. To get the underlying forward iterator, use `.base()`.

---

## 13. Function Objects in Algorithms

> Corresponds to Topic 8 PPT slide 24

STL algorithms that need a "callable" — `for_each`, `transform`, `sort`, `find_if`, etc. — can take **any** of:

- a free function (passing its name decays to a function pointer)
- a function pointer explicitly
- a class with `operator()` (a **functor**)
- a lambda (Week 7)

The algorithm doesn't care which; it just calls `fn(x)` or `fn(a, b)`. This is the **function object** abstraction.

**PPT slide 24 — two examples:**

```cpp
#include <iostream>
#include <list>
#include <algorithm>
using namespace std;

void print(int i) {
    cout << i << ' ';
}

int main() {
    list<int> L;
    for (int i = 1; i <= 5; ++i)
        L.push_back(i);

    // print all ints in the list
    for_each(begin(L), end(L), print);   // 'print' is passed as a function pointer
}
```

```cpp
int square(int i) {
    return i * i;
}

int main() {
    list<int> L1, L2;
    for (int i = 1; i <= 9; ++i)
        L1.push_back(i);

    // put squares of L1 into L2
    transform(begin(L1), end(L1),
              back_inserter(L2), square);
}
```

**The same examples with lambdas (more idiomatic in modern C++):**

```cpp
for_each(begin(L), end(L), [](int i){ cout << i << ' '; });

transform(begin(L1), end(L1), back_inserter(L2),
          [](int i){ return i * i; });
```

> 💡 **Why function objects matter**
> Without callable parameters, algorithms would need an explosion of overloads. `sort(v.begin(), v.end())` uses `<`; `sort(v.begin(), v.end(), greater<int>{})` uses `>`; `sort(v.begin(), v.end(), [](X a, X b){ return a.name < b.name; })` uses an arbitrary custom rule. Same algorithm, different **policy** — chosen by the caller.

---

## 14. Ranges (C++20)

> Corresponds to Topic 8 PPT slide 25

In all the examples so far, we've been passing **pairs** of iterators: `sort(v.begin(), v.end())`. This is verbose and error-prone — pass the wrong begin/end and you have UB.

**C++20 ranges** let you pass a **range** (typically the container itself) directly:

```cpp
// Range-based for loop (works since C++11)
for (auto e : v)
    cout << e;

// Algorithm calls (the new C++20 way)
sort(v.begin(), v.end());   // old: still works
sort(v);                    // C++20 ranges: uses v's range = v.begin()..v.end()
```

The C++20 `<ranges>` library defines `std::ranges::sort`, `std::ranges::find`, etc., which all accept ranges. Beyond convenience, ranges also enable **views** — lazy, composable transformations:

```cpp
auto evens_squared = v
                   | std::views::filter([](int x){ return x % 2 == 0; })
                   | std::views::transform([](int x){ return x * x; });
```

> 💡 **PPT pointer**
> For more, see [`https://en.cppreference.com/w/cpp/ranges`](https://en.cppreference.com/w/cpp/ranges). In ICS 45C you mostly only need to know that ranges **exist** and accept the container directly; the classic two-iterator form is still ubiquitous and entirely correct.

---

## 15. I/O Streams — The iostream Library

> Corresponds to LearnCpp 28.1

### 15.1 Why I/O Lives in the Library (not the language)

I/O functionality is **not** part of the core C++ language. It is provided by the standard library, in the `std` namespace. That's why every program needs `#include <iostream>` to use `cin`/`cout`.

When you include `<iostream>`, you gain access to a **class hierarchy** for I/O. Importantly, that hierarchy uses **multiple inheritance** (which was advised against in Week 7 / Week 6) — but the library has been carefully designed and tested to avoid the typical pitfalls, so you can use it without worry.

### 15.2 What is a Stream?

> 💡 **Key Insight (LearnCpp 28.1)**
> A **stream** is just a sequence of bytes that can be accessed sequentially. Over time, a stream may produce or consume potentially unlimited amounts of data.

Two flavors:

- **Input streams** hold data from a producer (keyboard, file, network). When you press a key, the byte enters the input stream and waits there until your program is ready for it.
- **Output streams** hold data for a consumer (monitor, file, printer). When you write, the data sits in the output stream until the consumer is ready.

Some devices (files, networks) are both producers and consumers.

> 💡 **The win** — once you learn stream operations, the same operations work for keyboards, files, network sockets, and string buffers. The OS hides the difference.

### 15.3 The Class Hierarchy

The key classes you should be able to name:

| Class | Purpose |
|---|---|
| `std::ios` (= `std::basic_ios<char>`) | Common base — holds flags shared by input and output streams |
| `std::istream` | Input stream — uses **`>>`** (extraction) |
| `std::ostream` | Output stream — uses **`<<`** (insertion) |
| `std::iostream` | Bidirectional — both input and output |

A simplified diagram:

```
            ios
           /   \
     istream   ostream
           \   /
          iostream
```

(Yes, that's multiple inheritance — the dreaded diamond. But again, the library handles it carefully.)

### 15.4 Standard Streams

C++ ships four pre-connected **standard stream objects** that you can use immediately:

| Object | Class | Tied to | Buffering |
|---|---|---|---|
| `std::cin`  | `istream` | standard input  (keyboard) | buffered |
| `std::cout` | `ostream` | standard output (monitor)  | buffered |
| `std::cerr` | `ostream` | standard error  (monitor)  | **unbuffered** — output appears immediately |
| `std::clog` | `ostream` | standard error  (monitor)  | buffered |

> 💡 **`cerr` vs. `clog`** — both go to standard error, but `cerr` is unbuffered (good for crash-time messages that must appear before the program dies) and `clog` is buffered (good for diagnostic logs where bulk efficiency matters). `clog` is rarely seen in practice.

> 💡 **Buffering explained**
> Buffered output collects bytes in memory and writes them in chunks (faster). Unbuffered output writes each byte immediately (slower, but you see results right away — and you don't lose anything if the program crashes mid-buffer).

---

## 16. Input with istream

> Corresponds to LearnCpp 28.2

### 16.1 The Extraction Operator `>>`

The extraction operator (`>>`) reads a value from an input stream. C++ has built-in extractions for every fundamental type. You can also overload `>>` for your own classes.

```cpp
int n;
std::cin >> n;            // read an int

double d;
std::cin >> d;            // read a double

char c;
std::cin >> c;            // read a single non-whitespace char

std::string s;
std::cin >> s;            // read a non-whitespace word
```

### 16.2 Buffer Overflow Danger with C-Strings

```cpp
char buf[10] {};
std::cin >> buf;          // ⚠ user could enter 18 characters → buffer overflow → UB
```

> ⚠️ **Best Practice (LearnCpp 28.2)**
> Generally speaking, it's a bad idea to make **any** assumption about how many characters your user will enter.

**Fix: `setw()`** from `<iomanip>` limits the number of characters read:

```cpp
#include <iomanip>
char buf[10] {};
std::cin >> std::setw(10) >> buf;   // reads at most 9 chars (room for '\0' terminator)
```

### 16.3 Extraction Skips Whitespace

> **Reminder (LearnCpp 28.2)** — the extraction operator **skips whitespace** (spaces, tabs, newlines).

```cpp
int main() {
    char ch{};
    while (std::cin >> ch)
        std::cout << ch;
}
// Input:  Hello my name is Alex
// Output: HellomynameisAlex      ← all spaces and newlines eaten
```

To keep the whitespace, use `get()`.

### 16.4 `get()`

`std::cin.get(ch)` reads **one character**, including whitespace.

```cpp
char ch{};
while (std::cin.get(ch))
    std::cout << ch;
// Input:  Hello my name is Alex
// Output: Hello my name is Alex   ← spaces preserved
```

There is also a string-buffer overload: `cin.get(buf, n)` reads up to `n-1` characters into `buf` and adds the terminator.

```cpp
char strBuf[11] {};
std::cin.get(strBuf, 11);     // reads up to 10 chars
std::cout << strBuf << '\n';
// Input:  Hello my name is Alex
// Output: Hello my n             ← only the first 10 chars
```

> ⚠️ **`get()` does not consume the delimiter** — usually the newline character.
> So a second `get()` immediately sees the leftover `\n` and stops without reading anything new.

```cpp
char strBuf[11]{};
std::cin.get(strBuf, 11);   // reads "Hello!"
std::cout << strBuf << '\n';

std::cin.get(strBuf, 11);   // sees leftover '\n', stops immediately!
std::cout << strBuf << '\n';
// Output:
// Hello!
//                          ← (empty)
```

### 16.5 `getline()` — Reads and Discards the Delimiter

`std::cin.getline(buf, n)` behaves like `get`, but **consumes and discards** the trailing newline. This is what you usually want for reading whole lines.

```cpp
char strBuf[11]{};
std::cin.getline(strBuf, 11);
std::cout << strBuf << '\n';

std::cin.getline(strBuf, 11);   // works correctly this time
std::cout << strBuf << '\n';
```

### 16.6 `gcount()` — How Many Were Read

After a `getline()` (or `get()` with a buffer), `cin.gcount()` returns the number of characters extracted (including the discarded delimiter).

```cpp
char strBuf[100]{};
std::cin.getline(strBuf, 100);
std::cout << strBuf << '\n';
std::cout << std::cin.gcount() << " characters were read\n";
```

### 16.7 `std::getline` for `std::string` (the Free Function)

There is a special non-member `getline` in `<string>` that reads a whole line into a `std::string`. **Use this in modern C++ — don't deal with `char[]` buffers if you can avoid it.**

```cpp
#include <string>
#include <iostream>

int main() {
    std::string strBuf;
    std::getline(std::cin, strBuf);
    std::cout << strBuf << '\n';
}
```

> ⚠️ **Classic mixed-mode bug**
> ```cpp
> int n;
> std::cin >> n;                    // reads number, leaves '\n' in buffer
> std::string line;
> std::getline(std::cin, line);     // reads empty line — eats the leftover '\n'
> ```
> Fix: between the two, call `std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');`.

### 16.8 Other Useful istream Functions

From LearnCpp 28.2:

| Function | What it does |
|---|---|
| `ignore()` | Discards the first character in the stream |
| `ignore(int n)` | Discards the first n characters |
| `ignore(n, delim)` | Discards up to n chars or until `delim` is seen |
| `peek()` | Returns the next character **without** removing it |
| `unget()` | Puts the last-read character back in the stream |
| `putback(ch)` | Puts a character of your choice back in the stream |

These are useful for hand-written parsers (look-ahead with `peek()`, error recovery with `putback()`).

For everything else, the reference is `https://en.cppreference.com/w/cpp/io/basic_istream`.

---

## 17. Output with ostream and ios

> Corresponds to LearnCpp 28.3

### 17.1 The Insertion Operator `<<`

The insertion operator puts data into an output stream. Predefined for every built-in type; you can overload it for your own classes.

```cpp
std::cout << "Hello, " << name << ", age " << age << '\n';
```

The interesting Week 8 content here is **formatting**: controlling *how* the data is written (base, precision, width, etc.).

### 17.2 Two Ways to Format: Flags vs. Manipulators

Both `istream` and `ostream` derive from `std::ios`, which holds the formatting state. You can change that state in two ways:

- **Flags** — boolean state variables, turned on with `setf()` and off with `unsetf()`
- **Manipulators** — objects you stream into the output (e.g. `std::hex`, `std::setw(10)`); they toggle the relevant flags for you

### 17.3 Flags via `setf` / `unsetf`

```cpp
std::cout.setf(std::ios::showpos);   // turn on the "show + before positive nums" flag
std::cout << 27 << '\n';             // prints +27
std::cout.unsetf(std::ios::showpos); // turn it off
std::cout << 28 << '\n';             // prints 28
```

**Multiple flags at once** using bitwise OR `|`:

```cpp
std::cout.setf(std::ios::showpos | std::ios::uppercase);
std::cout << 1234567.89f << '\n';    // prints +1.23457E+06
```

### 17.4 Format Groups (Critical Gotcha)

Some flags belong to **format groups** — sets of mutually exclusive options. Examples: `basefield` group (`dec`/`hex`/`oct`); `floatfield` group (`fixed`/`scientific`); `adjustfield` group (`left`/`right`/`internal`).

> ⚠️ **The Gotcha**
> `setf(std::ios::hex)` does **not** turn off `std::ios::dec`. Since `dec` was set by default and apparently takes precedence, you'll keep printing in decimal even after setting `hex`.

**Two fixes:**

```cpp
// Fix 1: explicitly unset the conflicting flag first
std::cout.unsetf(std::ios::dec);
std::cout.setf(std::ios::hex);
std::cout << 27 << '\n';            // 1b

// Fix 2: use the two-arg form of setf() that takes (flag, group)
//        — this turns OFF all flags in the group, then turns ON the one you want
std::cout.setf(std::ios::hex, std::ios::basefield);
std::cout << 27 << '\n';            // 1b
```

### 17.5 Manipulators — the Easy Way

Manipulators handle the group/flag logic for you:

```cpp
std::cout << std::hex << 27 << '\n';   // 1b
std::cout << 28 << '\n';               // 1c — still hex
std::cout << std::dec << 29 << '\n';   // 29 — back to decimal
```

In general: **prefer manipulators** for readability, fall back to flags only when no manipulator exists.

### 17.6 Useful Manipulators / Flags — Categorized Reference

#### Booleans

| Manipulator | Effect |
|---|---|
| `std::boolalpha` | print booleans as `"true"`/`"false"` |
| `std::noboolalpha` | print booleans as `1`/`0` (default) |

```cpp
std::cout << true << ' ' << false << '\n';
// 1 0
std::cout << std::boolalpha << true << ' ' << false << '\n';
// true false
```

#### Positive sign

| Manipulator | Effect |
|---|---|
| `std::showpos`   | prefix positive numbers with `+` |
| `std::noshowpos` | don't |

#### Case (for hex and scientific)

| Manipulator | Effect |
|---|---|
| `std::uppercase`   | uses upper-case letters (`E+007`, `1B`) |
| `std::nouppercase` | uses lower-case (`e+007`, `1b`) |

#### Numeric base

| Manipulator | Effect | Flag |
|---|---|---|
| `std::dec` | decimal (default) | `std::ios::dec` |
| `std::hex` | hexadecimal | `std::ios::hex` |
| `std::oct` | octal | `std::ios::oct` |

(All three belong to `std::ios::basefield`.)

### 17.7 Precision, Notation, Decimal Points (Floating Point)

| Manipulator | Effect |
|---|---|
| `std::fixed`        | decimal notation: `123.456`, no exponent |
| `std::scientific`   | scientific notation: `1.23456e+02` |
| `std::showpoint`    | always display a decimal point and trailing zeros |
| `std::noshowpoint`  | hide unnecessary trailing zeros (default) |
| `std::setprecision(int)` | sets number of digits (in `<iomanip>`) |

**The big rule about `precision`:**

- In **fixed** or **scientific** mode → precision = **digits after the decimal point**
- In **default** mode → precision = **total significant digits**

LearnCpp's worked example:

```cpp
std::cout << std::fixed << '\n';
std::cout << std::setprecision(3) << 123.456 << '\n';  // 123.456
std::cout << std::setprecision(4) << 123.456 << '\n';  // 123.4560
std::cout << std::setprecision(5) << 123.456 << '\n';  // 123.45600
std::cout << std::setprecision(6) << 123.456 << '\n';  // 123.456000
std::cout << std::setprecision(7) << 123.456 << '\n';  // 123.4560000

std::cout << std::scientific << '\n';
std::cout << std::setprecision(3) << 123.456 << '\n';  // 1.235e+002
std::cout << std::setprecision(4) << 123.456 << '\n';  // 1.2346e+002
// ... and so on
```

In **default (non-fixed, non-scientific)** mode:

```cpp
std::cout << std::setprecision(3) << 123.456 << '\n';  // 123
std::cout << std::setprecision(4) << 123.456 << '\n';  // 123.5
std::cout << std::setprecision(5) << 123.456 << '\n';  // 123.46
std::cout << std::setprecision(6) << 123.456 << '\n';  // 123.456
std::cout << std::setprecision(7) << 123.456 << '\n';  // 123.456
```

**Summary table (from LearnCpp 28.3):**

| Option | Precision | 12345.0 | 0.12345 |
|---|---|---|---|
| Normal | 3 | 1.23e+004 | 0.123 |
| Normal | 5 | 12345 | 0.12345 |
| Showpoint | 5 | 12345. | 0.12345 |
| Showpoint | 6 | 12345.0 | 0.123450 |
| Fixed | 3 | 12345.000 | 0.123 |
| Fixed | 6 | 12345.000000 | 0.123450 |
| Scientific | 3 | 1.235e+004 | 1.235e-001 |
| Scientific | 6 | 1.234500e+004 | 1.234500e-001 |

### 17.8 Width, Fill, and Justification

Without a **field width**, numbers print with no surrounding padding. With one, the number is padded (or, if it's wider than the field, the field is ignored — it never truncates).

| Manipulator | Effect |
|---|---|
| `std::setw(int)`    | sets the field width for the **next** output (in `<iomanip>`) |
| `std::setfill(char)`| sets the padding character (in `<iomanip>`) |
| `std::left`         | left-justify within the field |
| `std::right`        | right-justify (default) |
| `std::internal`     | left-justify the **sign**, right-justify the digits |

Default behavior is right-justification:

```cpp
std::cout << -12345 << '\n';                       // -12345
std::cout << std::setw(10) << -12345 << '\n';      //     -12345
std::cout << std::setw(10) << std::left  << -12345 << '\n'; // -12345
std::cout << std::setw(10) << std::right << -12345 << '\n'; //     -12345
std::cout << std::setw(10) << std::internal << -12345 << '\n'; // -    12345
```

With a fill character of `*`:

```cpp
std::cout.fill('*');
std::cout << std::setw(10) << -12345 << '\n';                 // ****-12345
std::cout << std::setw(10) << std::left  << -12345 << '\n';   // -12345****
std::cout << std::setw(10) << std::internal << -12345 << '\n';// -****12345
```

> ⚠️ **Watch out** — `setw()` (and `width()`) only affects the **next** output statement. They are **not sticky**. Most other flags/manipulators *are* sticky and remain set until you change them.


---

## 18. Week 8 Comprehensive Cheat Sheet

### 18.1 Container Decision Tree

```
Do you need to associate values with keys?
├── Yes ── Need ordered iteration? ── Yes → std::map (or multimap)
│                                  └─ No → std::unordered_map
└── No ── Need uniqueness?
         ├── Yes ── Need ordered iteration? ── Yes → std::set (or multiset)
         │                                  └─ No → std::unordered_set
         └── No ── Operations on?
                  ├── Both ends → std::deque
                  ├── Back only, need [] → std::vector
                  ├── Anywhere by iterator → std::list (or forward_list)
                  ├── Fixed size, no allocation → std::array
                  └── Restricted (LIFO/FIFO/priority) → stack, queue, priority_queue
```

### 18.2 Container Complexity Cheat Sheet

| Container | `op[i]` | `push_back` | `push_front` | `insert(it,x)` | `find(x)` |
|---|---|---|---|---|---|
| `vector` | O(1) | O(1) amortized | — (use `insert(begin)`, O(n)) | O(n) | O(n) (linear, unless sorted + `binary_search`) |
| `deque` | O(1) | O(1) | O(1) | O(n) | O(n) |
| `list` | — | O(1) | O(1) | O(1) | O(n) |
| `set` / `map` | — / O(log n) (map only) | — | — | O(log n) | O(log n) |
| `unordered_set` / `unordered_map` | — / O(1) (avg) | — | — | O(1) avg | O(1) avg |

**`std::vector` size vs capacity:**

```cpp
v.size();          // current element count
v.capacity();      // currently allocated storage (≥ size)
v.reserve(n);      // pre-allocate to avoid push_back reallocations
v.shrink_to_fit(); // non-binding request to shrink capacity to size
```

**`std::vector` iterator invalidation (memorize):**

- `push_back`, `emplace_back`, `insert`, `emplace`, `resize` → if capacity grows, **all** iterators invalid. Otherwise, only `end()` (or those at/after the insertion point).
- `erase` → erased element and **everything after**.
- `clear`, `operator=`, `assign` → **always all**.
- `reserve`, `shrink_to_fit` → if capacity changed, all; otherwise none.

**Map/set extras (cppreference):**

| Operation | Effect |
|---|---|
| `m.at(k)` | bounds-checked element access; **throws** `out_of_range` on missing key |
| `m[k]` | access OR **insert default** on missing key — never use on `const map` |
| `m.contains(k)` (C++20) | `bool` membership check (no insert side-effect) |
| `m.find(k)` | iterator to element or `m.end()` |
| `m.insert({k, v})` | does nothing if `k` already exists |
| `m.insert_or_assign(k, v)` (C++17) | overwrites if `k` exists, inserts otherwise |
| `m.try_emplace(k, args...)` (C++17) | constructs in place only when `k` is missing |
| `s.lower_bound(k)` | iterator to first element ≥ k (sorted containers only) |
| `s.upper_bound(k)` | iterator to first element > k |
| `s.equal_range(k)` | `{lower_bound(k), upper_bound(k)}` |

### 18.3 Iterator Cheat Sheet

| Operation | What it does |
|---|---|
| `c.begin()`, `c.end()` | Forward iterator pair `[begin, end)` |
| `c.cbegin()`, `c.cend()` | Const (read-only) version |
| `c.rbegin()`, `c.rend()` | Reverse iterator pair |
| `*it` | Element (or `it->m` for member access) |
| `++it` / `--it` | Advance / retreat |
| `it1 == it2` | Same position (not same value) |
| `std::next(it)`, `std::prev(it)` | Move without modifying the original |
| `std::distance(b, e)` | Number of steps from `b` to `e` |

**Iterator categories (from weakest to strongest):**

`input` → `forward` → `bidirectional` → `random-access` → `contiguous`
`output` (separate hierarchy)

### 18.4 Algorithm Cheat Sheet

```cpp
#include <algorithm>
#include <numeric>

// Searching
auto it1 = std::find(b, e, val);            // linear
auto it2 = std::find_if(b, e, pred);        // linear, takes a predicate
bool ok  = std::binary_search(b, e, val);   // requires sorted range
auto lb  = std::lower_bound(b, e, val);     // first >= val (sorted range)
auto ub  = std::upper_bound(b, e, val);     // first > val  (sorted range)

// Min/max
auto mn = std::min_element(b, e);
auto mx = std::max_element(b, e);

// Reordering
std::sort(b, e);                  // requires random-access iterators
std::sort(b, e, comp);            // with custom comparator
std::reverse(b, e);

// Numeric
int total = std::accumulate(b, e, 0);          // sum (in <numeric>)
std::iota(b, e, start);                        // fills b..e with start, start+1, ...
std::transform(b, e, out, fn);                 // apply fn to each, write to out

// Counting
int n  = std::count(b, e, val);
int n2 = std::count_if(b, e, pred);

// Bulk
std::copy(b, e, out);
std::for_each(b, e, fn);
```

### 18.5 Iterator Adapter Cheat Sheet

| Adapter | Constructs from | Each `*it = x;` calls |
|---|---|---|
| `back_inserter(c)`  | sequence container with `push_back`  | `c.push_back(x)`  |
| `front_inserter(c)` | sequence container with `push_front` | `c.push_front(x)` |
| `inserter(c, pos)`  | any container with `insert`          | `c.insert(pos, x)` |
| `ostream_iterator<T>(s, "delim")` | output stream | `s << x; s << "delim";` |
| `istream_iterator<T>(s)` | input stream | reads via `>>` |
| `istream_iterator<T>()` | (default) | represents EOF |

### 18.6 I/O Stream Cheat Sheet

**Predefined streams:**

| Object | Class | Tied to | Buffered? |
|---|---|---|---|
| `std::cin`  | `istream` | stdin (keyboard) | yes |
| `std::cout` | `ostream` | stdout (monitor) | yes |
| `std::cerr` | `ostream` | stderr (monitor) | **no** |
| `std::clog` | `ostream` | stderr (monitor) | yes |

**Input idioms:**

```cpp
std::cin >> x;                  // skip ws, read x (any built-in or overloaded type)
std::cin.get(ch);               // read a single char including ws
std::cin.get(buf, n);           // up to n-1 chars, leaves delimiter in stream
std::cin.getline(buf, n);       // up to n-1 chars, consumes & discards delimiter
std::getline(std::cin, str);    // free function — reads a line into std::string
std::cin.ignore(N, '\n');       // skip up to N chars or to '\n', inclusive
std::cin.peek();                // look at next char without consuming
std::cin.unget(); / putback(c); // push a char back into the stream

// Limit C-string extraction to avoid overflow:
#include <iomanip>
std::cin >> std::setw(N) >> buf;
```

**Output formatting manipulators:**

```cpp
#include <iomanip>

std::cout << std::boolalpha << b;          // print "true"/"false"
std::cout << std::hex      << 27;          // 1b
std::cout << std::dec      << 27;          // 27
std::cout << std::oct      << 27;          // 33
std::cout << std::showpos  << 27;          // +27
std::cout << std::uppercase<< 0xab;        // AB
std::cout << std::fixed       << std::setprecision(2) << 3.14159;  // 3.14
std::cout << std::scientific  << std::setprecision(3) << 1234.5;   // 1.234e+003
std::cout << std::setw(8)     << std::setfill('*') << std::left  << "hi";  // hi******
std::cout << std::setw(8)     << std::setfill('*') << std::right << "hi";  // ******hi
```

> ⚠️ **Sticky vs. one-shot**
> - **Sticky** (lasts until changed): `boolalpha`, `hex`, `fixed`, `setprecision`, `setfill`, `left`/`right`
> - **One-shot** (next output only): `setw` (and `width()`)

### 18.7 Function Object Forms

```cpp
// 1. Free function
void print(int i) { std::cout << i; }
std::for_each(b, e, print);

// 2. Function pointer (the above already decays to one)
void (*p)(int) = print;
std::for_each(b, e, p);

// 3. Functor (class with operator())
struct Print {
    void operator()(int i) const { std::cout << i; }
};
std::for_each(b, e, Print{});

// 4. Lambda (Week 7)
std::for_each(b, e, [](int i){ std::cout << i; });
```

---

## 19. Top Five Takeaways for Week 8

1. **The STL is a triangle: containers, iterators, algorithms.** Each algorithm is written **once** in terms of iterators, and each container exposes iterators **once**. The combinatorial explosion of "every algorithm × every container" collapses to *M + N* pieces instead of *M × N*. The moment you realize this, the library stops feeling like a phone book of trivia and starts feeling like a coherent design. The corollary you must memorize: **algorithms don't take containers — they take iterator pairs**.

2. **The right container is determined by what operation needs to be fast.** Use **`vector`** by default (random access, append at back, cache-friendly, fewest surprises). Use **`map`/`set`** when you look things up by a key or need automatic sorting. Use **`unordered_map`/`unordered_set`** when order doesn't matter and you want O(1) average lookup. Use **`list`** *only* when you do a lot of mid-sequence insertion/removal — its lack of random access and poor cache behavior make it much slower than vector for most workloads. Use **container adapters** (`stack`, `queue`, `priority_queue`) when you want to restrict the interface.

3. **The half-open range `[begin, end)` is the iterator contract.** `end()` does **not** point to the last element — it points one past it. Every loop is `for (auto it = c.begin(); it != c.end(); ++it)`. This convention makes loops uniform, makes empty containers work (`begin() == end()`), and is what allows `std::find` to return `end()` as the "not found" sentinel. **Always check** `if (it == c.end())` before dereferencing a search result.

4. **Iterator adapters turn "anything sequential" into an iterator.** `back_inserter(v)` lets `std::copy` grow `v` instead of overwriting; `istream_iterator<int>(cin)` and `ostream_iterator<int>(cout, "\n")` let the **same** algorithms work on keyboards, files, and string buffers. This is the secret to one-liner programs like *"read all words from stdin, sort them, print unique ones"* — three algorithms wired together by stream iterators. The lesson: when you need to feed an algorithm something that isn't already a container range, look for an adapter.

5. **C++ I/O formatting is a state machine.** `std::cout` carries its formatting settings between calls; setting `std::hex` once means *every subsequent* int prints in hex until you set `std::dec`. The single non-sticky exception is `std::setw()` — it applies to the **next** output only. Manipulators (`std::fixed`, `std::setprecision`, `std::setfill`, `std::left`, `std::hex`) are the readable way to drive the state machine; flags (`setf`/`unsetf`) are the low-level way and have the **format-group gotcha** — `setf(std::ios::hex)` alone *won't* disable `dec`. Use `setf(std::ios::hex, std::ios::basefield)` (two-arg form) or just use manipulators.

> ⚠️ **PPT-vs.-Reading priority reminder**: When Klefstad's PPT and LearnCpp disagree on terminology or examples, **the PPT wins** (it's authoritative for this course). When in doubt about Week 7 vs. Week 8 vs. Week 9 content, include the material — better to over-cover than under-cover.

> 💡 **Looking ahead to Week 9** — Topic 8 PPT slides 26–27 introduce the **standard exception hierarchy** (`std::bad_alloc`, `std::logic_error`, `std::out_of_range`, `std::runtime_error`, etc.) as the recommended way for STL operations to report errors. Those slides essentially continue the Week 7 exception topic; the hierarchy is already integrated in the Week 7 notes (sections 13 and 19.5). Expect Week 9 to move toward the second half of the course's exam material — possibly C compatibility (`ICS_45c_Week_12_C_Tour.pdf`) or other Topic 9 material.

