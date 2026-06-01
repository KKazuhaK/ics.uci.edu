# Information and Computer Science 45C — Week 9 Integrated Reading Notes

## Table of Contents

- [1. Weekly Learning Objectives](#1-weekly-learning-objectives)
- [2. Container Classes](#2-container-classes)
- [3. std::initializer_list](#3-stdinitializer_list)
- [4. assert and static_assert](#4-assert-and-static_assert)
- [5. Iterators — A Deeper Look](#5-iterators--a-deeper-look)
- [6. std::iterator_traits](#6-stditerator_traits)
- [7. Smart Pointers and Move Semantics — The Big Picture](#7-smart-pointers-and-move-semantics--the-big-picture)
- [8. std::unique_ptr](#8-stdunique_ptr)
- [9. std::shared_ptr](#9-stdshared_ptr)
- [10. Designing Classes That Use STL (Klefstad's "Using STL")](#10-designing-classes-that-use-stl-klefstads-using-stl)
- [11. C++20 Ranges and Views](#11-c20-ranges-and-views)
- [12. HW9 — Implementing SetList and MapArray Containers](#12-hw9--implementing-setlist-and-maparray-containers)
- [13. Iterator `++`/`--` — The Universal Skeleton (and the Random-Access Extras)](#13-iterator-----the-universal-skeleton-and-the-random-access-extras)
- [14. SetList Forward Iterator](#14-setlist-forward-iterator)
- [15. MapArray and Its Random-Access Iterator](#15-maparray-and-its-random-access-iterator)
- [16. Utilities for Keeping a Vector Sorted (lower_bound + vector::insert)](#16-utilities-for-keeping-a-vector-sorted-lower_bound--vectorinsert)
- [17. Week 9 Comprehensive Cheat Sheet](#17-week-9-comprehensive-cheat-sheet)
- [18. Top Five Takeaways for Week 9](#18-top-five-takeaways-for-week-9)

> UCI ICS 45C: Programming in C++ (35770)
> These notes integrate the Week 9 assigned reading material: LearnCpp 23.6 (Container classes), 23.7 (`std::initializer_list`), 9.6 (`assert` and `static_assert`), 18.2 (Introduction to iterators), 22.1 (Introduction to smart pointers and move semantics), 22.5 (`std::unique_ptr`), 22.6 (`std::shared_ptr`); the cppreference reference for `std::iterator_traits`; and Klefstad's *Topic 9* PPT — C++20 ranges/views, smart pointers, the HW9 `SetList` + `MapArray` containers and their iterators, and the "Using STL" design pattern. The trailing slides of Klefstad's *Topic 8* PPT that introduce ranges (slide 25) are also covered here because Topic 9's PPT expands on them.
>
> **Cross-week PPT content notes:**
> - **Topic 8 PPT slides 26–27** (standard C++ exception hierarchy, STL exceptions) cover material that was reading for Week 7 (LearnCpp 27.x). Those slides are already integrated in the Week 7 notes; not duplicated here.
> - **Topic 8 PPT slides 11–13** (basic iterator operations and the "ZZZ Activity: Linked List Iterator") line up with this week's reading on iterators (LearnCpp 18.2), so they appear in Section 5 of these notes.
> - **Topic 9 PPT slide 10** (Template Class `Array`) and the **HW9 design** in slides 9, 11–15 are written by Klefstad to set up the Week 9 homework — not part of any LearnCpp chapter. They appear in Section 12–Section 16.
> - Slides from Topic 9 that may extend into Week 10 (cppreference ranges link, specific HW9 details) are flagged with ⚠️ when uncertain, but kept in the notes for completeness.

---

## 1. Weekly Learning Objectives

> Bird's-eye view of the four conceptual blocks of Week 9

### 1.1 Designing your own container class (LearnCpp 23.6, 23.7; Topic 9 PPT slides 9–15)

- Understand: a **container class** is a class designed to hold and organize multiple instances of another type — and it has a fairly standardized minimal interface (construct, insert, remove, size, iteration, etc.)
- Master: writing a complete `IntArray` from scratch: dynamic storage, destructor, copy semantics, `resize`/`reallocate`, `insertBefore`/`remove`
- Master: enabling `MyClass x{1, 2, 3};` by adding a `std::initializer_list<T>` constructor
- Distinguish: brace `{}` initialization (favors list constructor) vs. parenthesis `()` initialization (uses non-list constructor)
- Understand: why adding a list constructor to an existing class can silently break callers
- Apply: the same pattern to build **HW9's `SetList<T>`** (linked list with forward iterator) and **`MapArray<K,V>`** (sorted vector of pairs with random-access iterator)

### 1.2 Defensive programming (LearnCpp 9.6)

- Understand: **preconditions, invariants, postconditions** as the contract a function makes
- Master: the **bouncer pattern** — early return on precondition failure
- Master: `assert(condition)` from `<cassert>` — runtime debugging aid that is compiled out when `NDEBUG` is defined
- Master: `static_assert(condition, message)` — compile-time check, zero runtime cost
- Distinguish: **asserts** (programmer error, never recover) vs. **error handling** (expected runtime conditions, recoverable)
- Apply: descriptive asserts via `assert(cond && "message")`

### 1.3 Iterators — properly this time (LearnCpp 18.2, cppreference iterator_traits; Topic 8 PPT slides 11–13)

- Understand: an **iterator** is an object that traverses a container and exposes a uniform interface (`*`, `++`, `==`, `!=`)
- Master: the **`begin()`/`end()` contract** with the half-open range `[begin, end)`
- Understand: a **pointer** *is* an iterator (the simplest case) — that is why `std::iterator_traits<T*>` exists
- Master: **iterator invalidation** — when modifying a container kills existing iterators, and the **`it = c.erase(it)` idiom** that recovers
- Master: the **five traits** every iterator must expose so generic algorithms can introspect it: `iterator_category`, `value_type`, `pointer`, `reference`, `difference_type`

### 1.4 Smart pointers — RAII for heap objects (LearnCpp 22.1, 22.5, 22.6; Topic 9 PPT slides 5–8)

- Understand: why raw pointers leak (early returns, exceptions) and how a smart pointer's **destructor** plugs the leak
- Understand: the difference between **copy semantics** (each owns its own copy) and **move semantics** (ownership transfers, source is reset)
- Master: `std::unique_ptr<T>` — single ownership, **non-copyable**, transferable via `std::move`
- Master: `std::shared_ptr<T>` — shared ownership via reference counting, **copyable**
- Master: factory functions `std::make_unique<T>(...)` and `std::make_shared<T>(...)`, and why they are preferred over `new`
- Apply: writing a linked list whose `next` is a `unique_ptr<Node>` or `shared_ptr<Node>` — and the surprising consequence that the `unique_ptr` version cannot offer iterators (since they would alias the owned `next` pointers)

### 1.5 Bridge: every "Week 9" tool you build is one half of *the user's* side of STL

The single big idea connecting all of Week 9: the STL is **extensible by the user**. Last week (Week 8) you learned how to *use* `vector`, `set`, `map`, `sort`, `find`, etc. This week you learn how to *write* your own classes that play by the same rules — container, iterator, traits — so that all the algorithms you learned about Week 8 also work on *your* containers. `SetList` and `MapArray` (HW9) are the proof.

---

## 2. Container Classes

> Corresponds to LearnCpp 23.6 + Topic 9 PPT slide 10 ("Template Class Array — a wrapper around a C-array")

### 2.1 What is a container class?

A **container class** is a class designed to hold and organize multiple instances of another type (a fundamental type like `int`, or another class). Real-life containers — boxes, bins, bookshelves — organize and protect what is inside them; in code, a container class does the same.

> 💡 **LearnCpp 23.6 framing**
> "Without containers, it would be extremely inconvenient to work with many objects. Imagine trying to read a book that didn't have any sort of binding."

You have already seen one container class many times: `std::vector<int>` (Week 8). Even C-style arrays are a primitive form of container, but `std::array`/`std::vector` are preferred because they offer **dynamic resizing**, they **remember their own size** when passed to functions, and they perform **bounds checking** (via `at()`). All three are weaknesses of raw arrays.

### 2.2 The minimal interface

Most well-defined containers provide functions that:

- Create an empty container (via a constructor)
- Insert a new object into the container
- Remove an object from the container
- Report the number of objects currently in the container (`size()`)
- Empty the container of all objects
- Provide access to the stored objects
- Sort the elements (optional)

Some container classes omit some of these. For example, array-like containers often omit `insert` and `remove` because they are O(n) and the designer wants to discourage them.

> Container classes implement a **member-of** relationship. Elements of an array are members-of the array. (LearnCpp's "member-of" is the everyday English sense, not "C++ class member".)

### 2.3 Value containers vs. reference containers

| Kind | What it stores | Owns the elements? | Analogous to |
|---|---|---|---|
| **Value container** | Copies of the objects | Yes — responsible for creating and destroying them | Composition (Ch. 23.2) |
| **Reference container** | Pointers or references to objects | No — owned elsewhere | Aggregation (Ch. 23.3) |

Most everyday containers (`std::vector<int>`, `std::list<std::string>`, …) are **value containers**. The `IntArray` we build below is a value container.

### 2.4 Containers only hold one type

Unlike Python's `list`, where you can mix `[1, "hello", 3.14, [4, 5]]` freely, C++ containers store a single, statically determined element type. If you need a "list of int and double," you write two containers — or you use templates (we will, below).

This is a feature, not a bug: knowing the element type at compile time enables index-as-fast-as-pointer-arithmetic access, no runtime type checks, and aggressive optimization.

> ⚠️ **Python → C++**
> Python list: `[1, "hi", 3.14]` — heterogeneous, every element is a tagged reference.
> C++ vector: `std::vector<int>{1, 2, 3}` — homogeneous, every element is a plain `int` in contiguous memory.

### 2.5 The simplest container: `IntArray` (full implementation from LearnCpp 23.6)

We will build an `IntArray` step by step. This is **exactly the kind of class you must write for HW9** — minus the templates and iterators, which Section 11–15 add on. It is also exactly the kind of class Klefstad's *Topic 9 PPT slide 10* refers to: "**Template Class Array — One complete example of the simplest container — a wrapper around a C-array — Array.cpp**".

#### Step 1: The data and the empty class

`IntArray` must track two things — the **length** of the array, and a **pointer to the dynamically allocated storage**.

```cpp
#ifndef INTARRAY_H
#define INTARRAY_H

class IntArray
{
private:
    int  m_length{};
    int* m_data{};
};

#endif
```

> ⚠️ **Why a pointer, not a fixed C-array?** We want the length to be settable at construction time, not baked into the type. That means dynamic allocation → `m_data` must be a pointer.

#### Step 2: Constructors (empty + sized)

```cpp
#include <cassert>  // for assert()
#include <cstddef>  // for std::size_t

class IntArray
{
private:
    int  m_length{};
    int* m_data{};

public:
    IntArray() = default;

    IntArray(int length) : m_length{ length }
    {
        assert(length >= 0);
        if (length > 0)
            m_data = new int[static_cast<std::size_t>(length)]{};
    }
};
```

Two things worth noticing:

1. The default constructor is explicitly `= default`. With it, `IntArray a;` gives an empty (zero-length, null-pointer) array.
2. The sized constructor uses `assert` (see Section 4) to guarantee `length >= 0` — this is a **precondition**.

#### Step 3: Destructor + `erase()`

```cpp
~IntArray()
{
    delete[] m_data;
    // No need to null out m_data or zero m_length — object is about to die.
}

void erase()
{
    delete[] m_data;
    m_data   = nullptr;  // MUST null out, since erase() is callable mid-life
    m_length = 0;
}
```

> ⚠️ **Why `erase()` nulls `m_data` but the destructor does not.**
> The destructor runs *exactly once*, at the end of the object's life. Anything left in `m_data` after the destructor returns is unreachable, so nulling it is wasted work. `erase()`, by contrast, leaves the object alive — if you don't null `m_data`, a later call to `erase()` would `delete[]` an already-freed pointer (UB).

#### Step 4: Element access and length

```cpp
int& operator[](int index)
{
    assert(index >= 0 && index < m_length);
    return m_data[index];
}

int getLength() const { return m_length; }
```

Returning a **reference** from `operator[]` is what lets us write `array[3] = 42;` (the bracket call is the left-hand side of the assignment).

The `assert` enforces bounds at debug-time. Note that `std::vector<int>::operator[]` does **not** bounds-check; only `vector::at()` does. Our `IntArray` is friendlier in debug builds.

#### Step 5: `reallocate` (fast, destructive) and `resize` (slow, preserving)

The reading writes these as two different functions because they have different cost/preservation trade-offs:

```cpp
#include <algorithm>  // for std::copy_n

// reallocate: destroys any existing elements, fast.
void reallocate(int newLength)
{
    erase();                                       // wipe old data first
    if (newLength <= 0) return;
    m_data   = new int[static_cast<std::size_t>(newLength)];
    m_length = newLength;
}

// resize: keeps elements that fit in the new size, slow.
void resize(int newLength)
{
    if (newLength == m_length) return;             // nothing to do
    if (newLength <= 0) { erase(); return; }       // shrink to empty

    // Allocate new storage, copy what fits, swap.
    int* data{ new int[static_cast<std::size_t>(newLength)] };
    if (m_length > 0)
    {
        int elementsToCopy{ (newLength > m_length) ? m_length : newLength };
        std::copy_n(m_data, elementsToCopy, data);
    }
    delete[] m_data;
    m_data   = data;
    m_length = newLength;
}
```

> 💡 **`std::copy_n(src, n, dst)`** — like `std::copy`, but takes a count instead of a `(src_begin, src_end)` pair. Works wherever you have a known-length source.

#### Step 6: Copy constructor and copy assignment (Rule of Three)

Because we manage a raw pointer (`m_data`), the **implicit copy constructor** would do a shallow copy → two `IntArray`s pointing at the same buffer → double-delete UB. We must write Rule of Three.

```cpp
// Use delegating constructor to size the new array, then copy elements.
IntArray(const IntArray& a) : IntArray(a.getLength())
{
    std::copy_n(a.m_data, m_length, m_data);
}

IntArray& operator=(const IntArray& a)
{
    if (&a == this) return *this;        // self-assignment check (Klefstad: address-based)
    reallocate(a.getLength());           // resize destination
    std::copy_n(a.m_data, m_length, m_data);
    return *this;
}
```

> ⚠️ **Klefstad convention** — the self-assignment guard uses **identity equality** (`&a == this`), not content equality (`a == *this`). Identity is a single pointer comparison; content equality could be O(n) and could also fail for types that don't define `operator==`.

#### Step 7: `insertBefore`, `remove`, and convenience wrappers

```cpp
void insertBefore(int value, int index)
{
    assert(index >= 0 && index <= m_length);  // <= because inserting at end is OK

    int* data{ new int[static_cast<std::size_t>(m_length + 1)] };
    std::copy_n(m_data, index, data);                       // before
    data[index] = value;                                    // the new element
    std::copy_n(m_data + index, m_length - index, data + index + 1);  // after, shifted
    delete[] m_data;
    m_data = data;
    ++m_length;
}

void remove(int index)
{
    assert(index >= 0 && index < m_length);

    if (m_length == 1) { erase(); return; }   // last element → empty

    int* data{ new int[static_cast<std::size_t>(m_length - 1)] };
    std::copy_n(m_data, index, data);
    std::copy_n(m_data + index + 1, m_length - index - 1, data + index);
    delete[] m_data;
    m_data = data;
    --m_length;
}

// Convenience wrappers:
void insertAtBeginning(int value) { insertBefore(value, 0); }
void insertAtEnd      (int value) { insertBefore(value, m_length); }
```

> ⚠️ **Both `insertBefore` and `remove` reallocate every time.** That's O(n) per insert/remove (and brings memory churn). `std::vector` mitigates this with `capacity()` — it overallocates so most `push_back`s are O(1). A real production container would do the same.

#### Step 8: Test it

```cpp
#include <iostream>
#include "IntArray.h"

int main()
{
    IntArray array(10);
    for (int i{0}; i < 10; ++i) array[i] = i + 1;

    array.resize(8);
    array.insertBefore(20, 5);
    array.remove(3);
    array.insertAtEnd(30);
    array.insertAtBeginning(40);

    { // copy/assign tests
        IntArray b{ array };
        b     = array;
        b     = b;       // self-assign (handled by the identity check)
        array = array;
    }

    for (int i{0}; i < array.getLength(); ++i)
        std::cout << array[i] << ' ';
    std::cout << '\n';
}
// Output: 40 1 2 3 5 20 6 7 8 30
```

### 2.6 What's still missing

LearnCpp 23.6 closes with a list of improvements that the full STL provides but our `IntArray` does not:

- Make it a **template class** so it works with any copyable element type — `IntArray` becomes `Array<T>`. (Topic 9 PPT slide 10 hints at exactly this with "Template Class `Array`".)
- Add `const` overloads of every member function that doesn't mutate, so it works on `const IntArray`.
- Add **move semantics** (move constructor, move assignment — Week 4 / Rule of Five).
- During `resize`/`insert`, move elements instead of copying.

> 💡 **Advanced (LearnCpp's "For advanced readers")**
> - Move only if the element's move constructor is **`noexcept`**; otherwise copy. This is what `std::move_if_noexcept` does.
> - Provide a **strong exception safety guarantee**: if `resize`/`insert` throws partway through, the original data is intact. (See LearnCpp 27.9 / 27.10.)

### 2.7 Klefstad's final word: "use STL when you can"

> 💡 **LearnCpp 23.6 closing** — "If a class in the standard library meets your needs, use that instead of creating your own. For example, instead of using `IntArray`, you're better off using `std::vector<int>`. It's battle tested, efficient, and plays nicely with the other classes in the standard library."

The point of *building* a container is to understand the contract, not to ship it. Once you have written `IntArray`, you understand `std::vector` from the inside. That understanding is what HW9 tests.

---
## 3. `std::initializer_list`

> Corresponds to LearnCpp 23.7

`std::initializer_list` is the mechanism that lets you write `MyClass x{1, 2, 3};` for your own class — the same brace-initialization syntax that works for `std::vector<int> v{1, 2, 3};`.

### 3.1 The problem: brace-initialization doesn't work on `IntArray` yet

Built-in arrays accept a brace-enclosed initializer list directly:

```cpp
int array[]{ 5, 4, 3, 2, 1 };           // OK
auto* arr2{ new int[5]{ 5, 4, 3, 2, 1 } }; // OK, dynamic
delete[] arr2;
```

But our `IntArray` from Section 2 does **not**:

```cpp
IntArray array{ 5, 4, 3, 2, 1 };  // ERROR: no matching constructor
```

It doesn't compile because `IntArray` has no constructor that knows what to do with the braced list. Without one, the only way to populate is element-by-element after construction — tedious and verbose.

### 3.2 What `std::initializer_list` actually is

> When the compiler sees a braced-enclosed `{1, 2, 3, ...}` in a context where it has to pick a type, it constructs a temporary object of type **`std::initializer_list<T>`**, a lightweight view over those values.

A few important facts (LearnCpp 23.7):

1. It lives in the `<initializer_list>` header.
2. You almost always see it spelled with an explicit element type: `std::initializer_list<int>`, `std::initializer_list<std::string>`, etc. A bare `std::initializer_list` is rare.
3. It exposes a **`size()`** member function (the count of elements) and **`begin()`/`end()`** iterators.
4. It is typically **passed by value**, not by `const&`. It is essentially a `(begin, end)` pair — a *view* — much like `std::string_view`. Copying it is cheap and never copies the underlying elements.

> 💡 **Mental model: it's a view, not a container**
> Like `std::string_view`, an `std::initializer_list` doesn't *own* anything; it points at storage that the caller (the temporary array the compiler creates from `{...}`) keeps alive. Don't return it from a function unless you know the underlying array outlives the call.

### 3.3 Adding the constructor — the delegating-constructor pattern

```cpp
#include <algorithm>          // std::copy
#include <cassert>
#include <initializer_list>   // std::initializer_list
#include <iostream>

class IntArray
{
private:
    int  m_length {};
    int* m_data   {};

public:
    IntArray() = default;

    IntArray(int length)
        : m_length{ length },
          m_data{ new int[static_cast<std::size_t>(length)]{} }
    {}

    // The new constructor:
    IntArray(std::initializer_list<int> list)
        : IntArray(static_cast<int>(list.size()))   // ← delegate to IntArray(int)
    {
        std::copy(list.begin(), list.end(), m_data);
    }

    ~IntArray() { delete[] m_data; }

    IntArray(const IntArray&)            = delete;  // to avoid shallow copies
    IntArray& operator=(const IntArray&) = delete;

    int& operator[](int index)
    {
        assert(index >= 0 && index < m_length);
        return m_data[index];
    }
    int getLength() const { return m_length; }
};

int main()
{
    IntArray array{ 5, 4, 3, 2, 1 };   // now uses the new constructor
    for (int i{0}; i < array.getLength(); ++i)
        std::cout << array[i] << ' ';  // prints: 5 4 3 2 1
}
```

A few things deserve unpacking:

- **Angle brackets are required.** The parameter type is `std::initializer_list<int>`, with the element type spelled out.
- **Pass by value.** Cheaper than indirection because the list is a view.
- **`list.size()` returns `size_t`** (unsigned) — we cast to `int` to feed `IntArray(int)`.
- **Delegating constructor.** `IntArray(static_cast<int>(list.size()))` calls the **other** `IntArray` constructor first. That allocates `new int[size]`. The body then copies the elements from the list into the freshly allocated buffer with `std::copy`.

### 3.4 No `operator[]`! Use `begin()` instead

`std::initializer_list` does not have `operator[]`, so you cannot subscript it directly. The two idiomatic workarounds:

```cpp
// 1. range-for
for (int x : list) { /* x is one element */ }

// 2. index through begin() — begin() returns a random-access iterator
for (std::size_t i{}; i < list.size(); ++i)
    m_data[i] = list.begin()[i];
```

> ⚠️ **Why no `operator[]`?** "For some inexplicable reason," LearnCpp says, "`std::initializer_list` does not provide access to the elements via subscripting. The omission has been noted many times to the standards committee and never addressed."

### 3.5 List initialization **prefers** list constructors

This is the single biggest gotcha of `std::initializer_list`.

```cpp
IntArray a1(5);    // direct init → IntArray(int)            → array of 5 zeros
IntArray a2{ 5 };  // list init  → IntArray(initializer_list) → array of 1 element with value 5
```

What changed between `a1` and `a2` is **how** they were initialized — parentheses vs. braces — and the compiler made a totally different choice based on that.

> 💡 **Key Insight (LearnCpp)**
> **List initialization favors matching list constructors over matching non-list constructors.**

The same rule applies to `std::vector` (and every other container with both a list constructor and a count-based one):

```cpp
std::vector<int> v1(5);    // 5 value-initialized zeros: 0 0 0 0 0
std::vector<int> v2{ 5 };  // one element with value 5
```

> ⚠️ **Best practice (LearnCpp)** — When initializing a container that has a list constructor:
> - Use **brace** initialization when intending to call the list constructor (your initializers are element values).
> - Use **direct (parenthesis)** initialization when intending to call a non-list constructor (your initializers are not element values — like a size, or constructor arguments).
>
> That is also why our delegating constructor above writes `: IntArray(static_cast<int>(list.size()))` with parentheses — if it used braces, the delegated call would resolve to the list constructor *again*, causing infinite delegation / compile error.

### 3.6 Adding a list constructor can break existing code

```cpp
class Foo {
public:
    Foo(int, int) { std::cout << "Foo(int, int)\n"; }
};

Foo f1{ 1, 2 };  // prints "Foo(int, int)"
```

Now add a list constructor to the class:

```cpp
class Foo {
public:
    Foo(int, int) { std::cout << "Foo(int, int)\n"; }
    Foo(std::initializer_list<int>) { std::cout << "Foo(initializer_list)\n"; }
};

Foo f1{ 1, 2 };  // now prints "Foo(initializer_list)" — silently!
```

> ⚠️ **Warning (LearnCpp)** — **Adding a list constructor to an existing class that did not have one may break existing programs.** Every brace-init call site that previously matched a non-list constructor now silently matches the new list constructor. There is no compile error to warn you.

### 3.7 List assignment — and the dangling-pointer trap

`std::initializer_list` also lets you implement *assignment* from a brace list:

```cpp
IntArray a;
a = { 1, 3, 5, 7, 9, 11 };  // we want this to work
```

But if you only provided a list **constructor** and not a list **assignment**, the compiler does something dangerous:

1. It can't find an `operator=` taking `initializer_list` → looks at other overloads.
2. It finds the implicitly-generated copy-assignment operator (`IntArray& operator=(const IntArray&)`).
3. To match that, it builds a **temporary `IntArray`** from `{ 1, 3, 5, ... }` (using your list constructor).
4. It calls the implicit copy assignment, which **shallow-copies** the temporary's `m_data` pointer into `a`.
5. The temporary is destroyed at the end of the assignment statement, which `delete[]`s the buffer.
6. `a.m_data` is now dangling. UB strikes the next time you use `a`.

> ⚠️ **Best practice (LearnCpp)** — If you provide list construction, **also provide list assignment** (or delete the copy assignment).
>
> If you implement a constructor taking `std::initializer_list`, do at least one of:
> 1. Provide an overloaded list assignment operator.
> 2. Provide a proper deep-copying copy assignment operator.
> 3. Delete the copy assignment operator (the `IntArray` above does this).

### 3.8 The full Quiz solution from LearnCpp 23.7

```cpp
IntArray& operator=(std::initializer_list<int> list)
{
    int length{ static_cast<int>(list.size()) };
    if (length != m_length)                       // resize if needed
    {
        delete[] m_data;
        m_length = length;
        m_data   = new int[list.size()]{};
    }
    std::copy(list.begin(), list.end(), m_data);  // overwrite contents
    return *this;
}
```

That works because we resize as needed and then deep-copy element-by-element — no shallow pointer copy, no dangling.

### 3.9 Python → C++ quick contrast

| | Python | C++ |
|---|---|---|
| Source | `x = [1, 2, 3]` is a **list literal** | `auto x = std::initializer_list<int>{1, 2, 3};` (rare) or, more commonly, `MyClass x{1, 2, 3};` |
| Type | One `list` type that accepts anything | Statically typed; `initializer_list<int>` won't accept strings |
| Ownership | List owns its elements (reference-counted) | `initializer_list` is a view; the backing array is a compiler-managed temporary |
| Mutability | List is mutable | `initializer_list` elements are `const` — you can read but not reassign |

---

## 4. `assert` and `static_assert`

> Corresponds to LearnCpp 9.6. PPT does not have a dedicated slide, but `assert` is sprinkled throughout the *Topic 9* code (e.g. the `IntArray` constructor's `assert(length >= 0)`).

### 4.1 Preconditions, invariants, postconditions

These three terms describe a function's contract:

| Term | When it must hold | Example |
|---|---|---|
| **Precondition** | Before a block of code (typically a function body) executes | `assert(y != 0)` before `x / y` |
| **Invariant** | While a block of code is executing (often inside a loop, or for the lifetime of a class object) | A balanced BST stays balanced through every insertion |
| **Postcondition** | After a block of code finishes | `assert(result >= 0)` after a function that should never return negative |

Preconditions are best placed at the **top** of a function, using **early return** (the "bouncer pattern") to bail out if they fail:

```cpp
void printDivision(int x, int y)
{
    if (y == 0)
    {
        std::cerr << "Error: Could not divide by zero\n";
        return;                       // bounce the caller out
    }
    // From here on, y != 0 is guaranteed.
    std::cout << static_cast<double>(x) / y;
}
```

> 💡 **The bouncer pattern (LearnCpp)** has two benefits:
> 1. All test cases are up-front, alongside the error-handling code.
> 2. Less nesting in the happy path.
>
> The opposite — `if (good) { do work } else { handle error; return; }` — is strictly worse because it separates the error case from where you noticed it, and it adds nesting.

> 💡 **Class invariants** are a later topic (Ch. 14.2): some condition that must always hold for an object of a class (e.g., for `std::set`, "elements are sorted at all times"). Every class member function must preserve the invariant.

### 4.2 What is an assertion?

An **assertion** is an expression that is expected to be `true` unless there is a bug.

- If true → assert does nothing, program continues.
- If false → an error message is printed, and the program is terminated via `std::abort()`.

The printed message typically includes the failed expression as text, the source file, and the line number. That makes assertions an excellent debugging tool.

> 💡 **Key Insight (LearnCpp)** — **Asserts are used to detect errors during development and debugging.** When an assertion fails, the program stops immediately, giving you a chance to attach a debugger and inspect state. Without the assert, the bad value would silently propagate and cause failure somewhere far away — much harder to debug.

### 4.3 Using `assert`

```cpp
#include <cassert>   // for assert()
#include <cmath>     // for std::sqrt
#include <iostream>

double calculateTimeUntilObjectHitsGround(double initialHeight, double gravity)
{
    assert(gravity > 0.0);   // precondition

    if (initialHeight <= 0.0)
        return 0.0;          // already on (or below) the ground

    return std::sqrt((2.0 * initialHeight) / gravity);
}

int main()
{
    std::cout << "Took "
              << calculateTimeUntilObjectHitsGround(100.0, -9.8)
              << " second(s)\n";
}
```

Running this prints something like:

```
dropsimulator: src/main.cpp:6: double calculateTimeUntilObjectHitsGround(double, double): Assertion 'gravity > 0.0' failed.
```

> 💡 **Key Insight (LearnCpp)** — **Asserts are better than comments**, because they both *document* and *enforce* a condition. Comments can drift out of sync with code; an assert that doesn't match the code is itself a bug, so developers fix it.

### 4.4 Making asserts self-explanatory

The bare assertion `assert(found);` produces a cryptic message:

```
Assertion failed: found, file C:\...Test.cpp, line 34
```

Trick: AND the condition with a string literal. A string literal always evaluates to `true`, so `cond && "message"` has exactly the same truth value as `cond`:

```cpp
assert(found && "Car could not be found in database");
```

Now the failure message includes your explanation:

```
Assertion failed: found && "Car could not be found in database", file ..., line 34
```

You can use this same trick to mark unimplemented code paths:

```cpp
assert(moved && "Need to handle case where student was moved to another classroom");
```

If a tester ever runs the code along that path, the failed assert spells out exactly what work remains.

### 4.5 `NDEBUG` — turning asserts off in release builds

Every `assert` carries a small runtime cost. In release builds, the assumption is that the code has already been tested, so asserts are unnecessary. C++ provides a built-in switch:

> **If the preprocessor macro `NDEBUG` is defined, the `assert` macro is disabled.**

Most IDEs (Visual Studio, etc.) define `NDEBUG` automatically in their **Release** configuration but not in **Debug**. The result: asserts catch bugs during development, then quietly stand down in production.

> 💡 **Tip (LearnCpp)** — For testing, you can enable or disable asserts in **one translation unit** by placing one of these **before** any `#includes`:
> ```cpp
> #define NDEBUG   // disable asserts here
> #undef  NDEBUG   // force-enable asserts here
> #include <cassert>
> ```
> The line must not end with a semicolon.

### 4.6 `static_assert` — checked at compile time

```cpp
static_assert(condition, "diagnostic message");   // C++11
static_assert(condition);                          // C++17, message optional
```

A `static_assert` is checked by the **compiler**. If `condition` is false, the compiler emits an error containing your message; compilation fails.

```cpp
static_assert(sizeof(long) == 8, "long must be 8 bytes");
static_assert(sizeof(int)  >= 4, "int must be at least 4 bytes");

int main() { return 0; }
```

On a machine where `long` is 4 bytes, compilation fails with something like:

```
error C2338: long must be 8 bytes
```

Important properties (LearnCpp 9.6):

- The condition must be a **constant expression** — the compiler must be able to evaluate it at compile time. `sizeof`, `constexpr` variables, and `consteval` calls all qualify; a function call with runtime data does not.
- `static_assert` is a **keyword**, not a macro, so you don't need any header.
- `static_assert` is **not** turned off by `NDEBUG` — it's a compile-time check, so it has no runtime cost in either configuration.
- It may appear **anywhere** in source code — global scope, namespace scope, class body, function body.

> ⚠️ **Best practice (LearnCpp)** — **Favor `static_assert` over `assert()` whenever the condition can be evaluated at compile time.** Compile-time errors are caught earlier, are guaranteed to be caught (no "I forgot to test that branch"), and have zero runtime cost.

### 4.7 `assert` vs. error handling — when to use which

| | `assert` | Error handling |
|---|---|---|
| What it detects | **Programming bugs** — conditions that should never occur in correct code | **Expected runtime conditions** — bad user input, missing file, network failure |
| Whose fault | The programmer's | The user's, or the environment's |
| Recovery | None — `abort` immediately | Often possible — return error, throw exception, retry |
| Runtime cost | Low; vanishes in release | Always present |
| Use liberally? | Yes — they cost nothing in release | Only where needed; each one has runtime + development cost |

Sometimes you want **both**:

```cpp
double getInverse(double x)
{
    assert(x != 0.0);          // catches bugs in debug builds
    if (x == 0.0)
        // handle error somehow (e.g. throw an exception)
        ;
    return 1.0 / x;
}
```

During development, the `assert` fires immediately if any caller passes 0 — you find the bug fast. In production, the `assert` is compiled out, but the `if (x == 0.0)` branch still handles the case gracefully if some untested path leads here.

### 4.8 Pitfalls (LearnCpp's "Some assert limitations and warnings")

- **A poorly-written assert** can either fire when it shouldn't or fail to fire when it should — be careful with the condition.
- **No side effects in assert expressions.** If `NDEBUG` is defined, the entire `assert(...)` call is removed by the preprocessor — including any work being done in the expression. So `assert(++counter > 0);` will be a behavior-divergence bug between debug and release builds. Bad:
  ```cpp
  assert(loadConfig() == 0);  // ⚠️ in release: loadConfig() never runs
  ```
  Good:
  ```cpp
  int result = loadConfig();
  assert(result == 0);
  ```
- **`abort()` is abrupt.** It terminates the process with no chance to run destructors, close files, or flush buffers. If your program might leave persistent state in an inconsistent shape on a hard exit (e.g., partially-written database), prefer error handling.

---
## 5. Iterators — A Deeper Look

> Corresponds to LearnCpp 18.2 + Topic 8 PPT slides 11–13 (basic iterator operations and the "ZZZ Activity: Linked List Iterator")

Week 8 introduced iterators as the connective tissue between containers and algorithms. Week 9's reading goes deeper into **what an iterator actually is**, **how to write one yourself** (which you need for HW9's `SetList` and `MapArray`), and **how iterator invalidation works**.

### 5.1 The many ways to walk a container

Before defining iterators properly, LearnCpp 18.2 reminds you of all the ways you have *already* seen:

```cpp
#include <array>
#include <cstddef>
#include <iostream>

int main()
{
    std::array arr{ 0, 1, 2, 3, 4, 5, 6 };       // C++17 CTAD: std::array<int, 7>
    std::size_t length{ std::size(arr) };

    // 1. while-loop with explicit index
    std::size_t index{ 0 };
    while (index < length)
        std::cout << arr[index++] << ' ';
    std::cout << '\n';

    // 2. for-loop with explicit index
    for (index = 0; index < length; ++index)
        std::cout << arr[index] << ' ';
    std::cout << '\n';

    // 3. for-loop with pointer arithmetic
    for (auto ptr{ &arr[0] }; ptr != (&arr[0] + length); ++ptr)
        std::cout << *ptr << ' ';
    std::cout << '\n';

    // 4. range-based for-loop
    for (int i : arr)
        std::cout << i << ' ';
    std::cout << '\n';
}
```

Each form has limitations:

- **Index-based** (forms 1 & 2) — only works for containers that support `[]` (`vector`, `array`, `deque`, `string`); useless for `list`, `set`, `map`.
- **Pointer arithmetic** (form 3) — only works when elements are stored contiguously in memory (arrays, vectors). Doesn't work for `list`, `set`, `map` whose nodes are scattered.
- **Range-based for** (form 4) — works for **everything that has `begin()` and `end()`** (or that `std::begin`/`std::end` know about). What's the mechanism?

> 💡 **The mechanism is iterators.** Range-based for is sugar for `for (auto it = c.begin(); it != c.end(); ++it) { auto&& x = *it; ... }`.

> 💡 **Pointers as iterators for non-contiguous structures** (LearnCpp's "For advanced readers"): in a linked list, each node has a `next` pointer; you can iterate by following that chain. Even without arithmetic, a pointer can play the role of an iterator — `++` becomes `p = p->next`. This is exactly what Klefstad's HW9 forward iterator (Section 14) does.

### 5.2 What an iterator is

> **An iterator is an object designed to traverse through a container, providing access to each element along the way.**

A container may provide multiple iterators (forwards, reverse, const, etc.), but every iterator follows the same interface conventions:

- `operator*` — dereference to get the current element
- `operator++` — advance to the next element
- `operator==` / `operator!=` — compare two iterators (mostly used as "have I reached `end()`?")

Once you commit to this interface, you can **iterate any container uniformly**, regardless of its internal data structure. That is the entire reason the STL scales: write the algorithm once in terms of iterators, and it works on every container that provides them.

### 5.3 The pointer is the simplest iterator

A raw pointer already supports `*`, `++`, `==`, `!=`. So a `T*` *is* an iterator over a `T[]` array:

```cpp
#include <array>
#include <iostream>

int main()
{
    std::array arr{ 0, 1, 2, 3, 4, 5, 6 };

    auto begin{ &arr[0] };
    auto end  { begin + std::size(arr) };   // one past the last element

    for (auto ptr{ begin }; ptr != end; ++ptr)
        std::cout << *ptr << ' ';
    std::cout << '\n';
}
// Output: 0 1 2 3 4 5 6
```

> ⚠️ **Subtle bug** — you might be tempted to write
> ```cpp
> int* end{ &arr[std::size(arr)] };   // ⚠️ UB
> ```
> This is undefined behavior, because `arr[std::size(arr)]` *dereferences* an off-the-end element (`[]` is `*(arr + n)`). Use one of:
> ```cpp
> int* end{ arr.data() + std::size(arr) };  // ✓
> int* end{ &arr[0]   + std::size(arr) };   // ✓
> ```
> The address-arithmetic by itself is fine; the dereference is the UB.

### 5.4 Standard library iterators: `begin()` / `end()`

Every standard container exposes the iterator pair via member functions:

```cpp
#include <array>
#include <iostream>

int main()
{
    std::array array{ 1, 2, 3 };

    auto begin{ array.begin() };
    auto end  { array.end()   };

    for (auto p{ begin }; p != end; ++p)
        std::cout << *p << ' ';
    std::cout << '\n';
}
// Output: 1 2 3
```

There are also **free functions** `std::begin(c)` and `std::end(c)`:

> 💡 **Tip (LearnCpp)** — `std::begin` and `std::end` for C-style arrays live in `<iterator>`. For STL containers, they live in the container's own header (`<array>`, `<vector>`, …) — but you almost never need to explicitly `#include <iterator>` because the container header has already done it.

```cpp
auto begin{ std::begin(array) };
auto end  { std::end  (array) };
```

> 💡 **Why the free functions matter** — they work for **C-style arrays** too: `int arr[5]; std::begin(arr); std::end(arr);` — the member-function version of course doesn't (a C array isn't an object with members).

### 5.5 Klefstad PPT slide 11 — iterators are "similar to array pointer arithmetic"

Topic 8 PPT slide 11 puts it succinctly:

```cpp
vector<int> V = {9, 7, 5, 3, 1, 2, 4, 6, 8, 10};
for ( vector<int>::iterator p = V.begin(); p != V.end(); ++p )
    cout << *p << endl;
```

> 💡 **Klefstad's framing** —
> - **defined for every container `C`**
> - **`C.begin()`** — the start of the collection
> - **`C.end()`** — **one past** the end of the collection (the half-open range convention)

### 5.6 `operator!=` vs. `operator<` in iterator loops

In numeric `for` loops with an `int` index, LearnCpp's earlier convention (Ch. 8.10) preferred `<`:

```cpp
for (int index = 0; index < length; ++index) ...
```

But for iterators, the **convention is `!=`**:

```cpp
for (auto p = begin; p != end; ++p) ...
```

Why? **Some iterator types are not relationally comparable.** `std::list<T>::iterator` (a node pointer) supports `==`/`!=` but not `<` (what would "less than" mean for two pointers into a linked list?). `!=` works for all iterator categories; `<` only works for random-access iterators.

> 💡 **Why is `[begin, end)` half-open?** Three benefits:
> 1. **Length is `end - begin`** without an "off by one" correction.
> 2. **An empty range is `begin == end`** — uniform with non-empty ranges.
> 3. **`find` returns `end()` to mean "not found"** — a single sentinel that is always available.

### 5.7 Range-based for ↔ iterators

Range-based for is built on top of `begin()` / `end()`:

```cpp
for (int i : array) std::cout << i << ' ';
```

Behind the scenes the compiler generates something equivalent to:

```cpp
{
    auto&& __range = array;
    auto __begin = std::begin(__range);
    auto __end   = std::end  (__range);
    for (; __begin != __end; ++__begin)
    {
        int i = *__begin;
        std::cout << i << ' ';
    }
}
```

That is why **any type with `begin()`/`end()` works in range-based for** — including types you write yourself (like HW9's `SetList`).

> 💡 **`std::array` works in range-based for; dynamic C-style arrays do not.** Why? Because `std::end` for a raw decayed array (a `T*`) has no way to know the length. The type information is lost.

### 5.8 Klefstad PPT slide 12 — Iterator operations cheat sheet

The standard iterator operations, drawn from Klefstad Topic 8 PPT slide 12:

| Operator | What it does |
|---|---|
| `operator*` | returns the element at the current position |
| `operator->` | allows member selection from the current element (e.g. `it->name`) |
| `operator++` | moves to the next element |
| `operator--` | moves to the previous element |
| `operator==` / `operator!=` | compares two iterators (positions) |
| `operator=` | assigns one iterator's position to another |

Not every iterator supports every operator — that's the **iterator categories** story (covered in Week 8). A `forward_iterator` has `++` but not `--`; a `random_access_iterator` has `+`, `-`, `[]` on top.

### 5.9 Klefstad PPT slide 13 — "ZZZ Activity: Linked List Iterator"

> ⚠️ **"ZZZ Activity"** is Klefstad's lecture cue for "this is something we will return to in detail" — and indeed HW9's `SetList` iterator (Section 14) is exactly this.

The setup on slide 13:

```cpp
struct Node { char data; Node * next; };

struct List {
    Node *head;
    struct iterator { /* ... */ };
    iterator begin();
    iterator end();
    // ...
};

List L;
// 1. Old-school: raw pointer traversal
for ( Node *p = L.head; p != nullptr; p = p->next )
    cout << p->data;

// 2. STL-style: iterator traversal
for ( List::iterator it = L.begin(); it != L.end(); ++it )
    cout << (*it).data;

// 3. Range-based for (sugar for #2)
for (auto e : L) cout << e;

// What the iterator looks like:
struct List::iterator {
    Node * ptr;
    operator->();
    operator *();
    // ... operator++(), operator==(), etc.
};
```

> 💡 **Klefstad's key idea** — you can write a "**custom pointer**" (`struct iterator { Node* ptr; ... }`) that *behaves like* a pointer to a list node but adds operator overloads so that user code can iterate the list as if it were an array. This is the exact recipe HW9 uses.

> ⚠️ **What `end()` for a linked list should return** — by convention, the iterator's `ptr` is `nullptr`. Then `it != L.end()` is the same as `it.ptr != nullptr`, which is the same as the raw-pointer loop's termination condition.

### 5.10 Iterator invalidation (LearnCpp 18.2 — critical)

Just like raw pointers can dangle, **iterators can be left pointing at storage that has been moved or destroyed**. We say the iterator has been **invalidated**. Using an invalidated iterator is undefined behavior.

Some operations on a container can cause this side-effect. Good reference documentation lists exactly which operations may invalidate iterators (e.g., [cppreference's iterator-invalidation table for `std::vector`](https://en.cppreference.com/w/cpp/container/vector#Iterator_invalidation)).

#### Example 1: range-based for + container mutation

```cpp
#include <vector>

int main()
{
    std::vector v { 0, 1, 2, 3 };

    for (auto num : v)
    {
        if (num % 2 == 0)
            v.push_back(num + 1);  // ⚠️ push_back may reallocate → invalidates the iterator
                                   //    used internally by range-for → UB
    }
}
```

> ⚠️ **The classic "modify-while-iterating" bug.** Range-based for is using a hidden iterator into `v`; `push_back` can reallocate `v`'s buffer, leaving that iterator dangling.

#### Example 2: `erase` invalidates the erased iterator (and friends)

```cpp
#include <iostream>
#include <vector>

int main()
{
    std::vector v{ 1, 2, 3, 4, 5, 6, 7 };
    auto it{ v.begin() };
    ++it;                       // now points at 2
    std::cout << *it << '\n';   // 2

    v.erase(it);                // erases the 2 — `it` is now invalidated

    ++it;                       // ⚠️ UB
    std::cout << *it << '\n';   // ⚠️ UB
}
```

#### The fix: the `it = c.erase(it)` idiom

`erase()` **returns an iterator to the element one past the erased one** (or `end()` if you erased the last). Reassign it back:

```cpp
auto it{ v.begin() };
++it;                                // 2
it = v.erase(it);                    // it now points at 3
std::cout << *it << '\n';            // 3, no UB
```

You will see this pattern over and over in real code — any loop that conditionally erases. The general shape:

```cpp
for (auto it = c.begin(); it != c.end(); /* no ++ here */)
{
    if (should_erase(*it))
        it = c.erase(it);            // erase advances it
    else
        ++it;                        // otherwise advance manually
}
```

> 💡 **C++20 alternative** — `std::erase(c, value)` and `std::erase_if(c, predicate)` do this loop for you, correctly.

---

## 6. `std::iterator_traits`

> Corresponds to the cppreference page on `std::iterator_traits`. PPT references it implicitly in *Topic 9* slide 12 (SetList iterator) and slide 14 (MapArray iterator): both define the same five typedefs (`iterator_category`, `value_type`, `pointer`, `reference`, `difference_type`).

### 6.1 The problem `iterator_traits` solves

Suppose you write a generic algorithm — say, `std::reverse` — that should work on any kind of iterator. Inside, you might need to know:

- What type does dereferencing yield? (`value_type`)
- What category is this iterator? (`random_access`, `bidirectional`, …) so you can pick the most efficient algorithm
- What type is `iter_end - iter_begin`? (`difference_type`)

If you wrote `typename Iter::value_type` directly, that works for iterators that expose those typedefs as nested types of their own — but it **doesn't work for raw pointers**, because `int*` has no `int*::value_type` (pointers are built-in types, not classes).

`std::iterator_traits` is the **uniform interface**:

```cpp
typename std::iterator_traits<Iter>::value_type
```

works for **every** kind of iterator — including raw pointers, because the standard library provides **partial specializations** of `iterator_traits` for `T*` and `const T*`.

### 6.2 The traits — five (sometimes six) typedefs

Every iterator must (or should) expose:

| Member type | Meaning |
|---|---|
| `difference_type` | A signed integer type capable of representing `iter1 - iter2` distance |
| `value_type` | The type of the elements being iterated (the type returned by `*iter`, modulo references) |
| `pointer` | A pointer-to-element type (used by `operator->`) |
| `reference` | A reference-to-element type (the actual return type of `*iter`) |
| `iterator_category` | One of the **iterator category tags** (see below) |

(C++20 added an optional `iterator_concept` for the iterator-concept machinery; not required for HW9.)

### 6.3 The iterator category tags

`iterator_category` must be one of these tag types, declared in `<iterator>`:

| Tag | Powers |
|---|---|
| `std::input_iterator_tag` | read once, single-pass, `++` |
| `std::output_iterator_tag` | write once, single-pass, `++` |
| `std::forward_iterator_tag` | read/write, multi-pass, `++` |
| `std::bidirectional_iterator_tag` | forward + `--` |
| `std::random_access_iterator_tag` | bidirectional + `+`, `-`, `[]`, `<` |
| `std::contiguous_iterator_tag` (C++17) | random access + storage is contiguous in memory |

> 💡 **Why categories exist** — algorithms can introspect the category at compile time and dispatch to an efficient implementation. For example, `std::sort` requires random-access iterators (it uses `[]` and bounded distances); `std::find` only needs input iterators.

### 6.4 Why raw pointers work — the `T*` specialization

For any pointer `T*`, the library provides:

| Member | Definition for `T*` |
|---|---|
| `difference_type` | `std::ptrdiff_t` |
| `value_type` | `T` (in C++20: `std::remove_cv_t<T>`) |
| `pointer` | `T*` |
| `reference` | `T&` |
| `iterator_category` | `std::random_access_iterator_tag` |
| `iterator_concept` (C++20) | `std::contiguous_iterator_tag` |

There is also a separate `const T*` specialization (for read-only iteration) with `pointer = const T*`, `reference = const T&`.

> 💡 **What this lets you do** — you can write a generic algorithm like
> ```cpp
> template<class Iter>
> void my_reverse(Iter first, Iter last) {
>     typename std::iterator_traits<Iter>::difference_type n = std::distance(first, last);
>     for (--n; n > 0; n -= 2) { /* ... */ }
> }
> ```
> and call it on `std::vector<int>::iterator`, `std::list<int>::iterator`, **and** a raw `int*` — `iterator_traits` unifies them.

### 6.5 The cppreference `my_reverse` example, walked through

```cpp
#include <iostream>
#include <iterator>
#include <list>
#include <vector>

template<class BidirIt>
void my_reverse(BidirIt first, BidirIt last)
{
    typename std::iterator_traits<BidirIt>::difference_type n
        = std::distance(first, last);                            // ① "how many?"

    for (--n; n > 0; n -= 2)
    {
        typename std::iterator_traits<BidirIt>::value_type tmp   // ② element type
            = *first;
        *first++ = *--last;
        *last    = tmp;
    }
}

int main()
{
    std::vector<int> v{1, 2, 3, 4, 5};
    my_reverse(v.begin(), v.end());            // vector iterator
    for (int n : v) std::cout << n << ' ';
    std::cout << '\n';

    std::list<int> l{1, 2, 3, 4, 5};
    my_reverse(l.begin(), l.end());            // list iterator
    for (int n : l) std::cout << n << ' ';
    std::cout << '\n';

    int a[]{1, 2, 3, 4, 5};
    my_reverse(a, a + std::size(a));           // raw pointer (!) — works because of T* specialization
    for (int n : a) std::cout << n << ' ';
    std::cout << '\n';
}
// 5 4 3 2 1
// 5 4 3 2 1
// 5 4 3 2 1
```

The same `my_reverse` template works on three completely different iterator types — `vector::iterator`, `list::iterator`, and raw `int*` — because `iterator_traits` provides a uniform answer to "what is the value type? what is the difference type?" regardless.

The commented-out line is also informative:

```cpp
// std::istreambuf_iterator<char> i1(std::cin), i2;
// my_reverse(i1, i2);   // compile error: input iterators only support ++, not --
```

That fails because input iterators don't support `--`, and `my_reverse` calls `--last`. The compiler catches the mismatch at template instantiation time.

### 6.6 What you must declare in your own iterator (for HW9)

If you write a custom iterator and want it to play with STL algorithms, you must expose all five traits. Klefstad's *Topic 9 PPT slide 12* (SetList iterator) and slide 14 (MapArray iterator) both do exactly this:

```cpp
struct iterator {
    // The five required traits:
    using iterator_category = std::forward_iterator_tag;   // or random_access_iterator_tag
    using value_type        = SetList::value_type;
    using pointer           = value_type*;
    using reference         = value_type&;
    using difference_type   = std::ptrdiff_t;

    // The operations:
    iterator(ListNode* node);
    iterator operator++();
    bool     operator==(const iterator& other) const;
    bool     operator!=(const iterator& other) const;
    reference operator*() const;

private:
    ListNode* current;
};
```

If you provide these typedefs, **`std::iterator_traits<your_iterator>::value_type` etc. will Just Work**, because the primary template extracts the typedefs from the iterator type itself.

> 💡 **`std::ptrdiff_t`** — a signed integer type wide enough to express any pointer difference. Lives in `<cstddef>`. Almost always 64-bit on modern systems.

> ⚠️ **Deprecated since C++17**: inheriting from `std::iterator<…>` to "get" these typedefs. Don't do it. Declare the typedefs by hand — that is what slide 12 and 14 do.

---
## 7. Smart Pointers and Move Semantics — The Big Picture

> Corresponds to LearnCpp 22.1 + Topic 9 PPT slide 5

### 7.1 The motivating problem: raw pointers leak

Consider:

```cpp
void someFunction()
{
    Resource* ptr = new Resource();
    // ... do stuff with ptr ...
    delete ptr;
}
```

This looks fine — until you add an early return or a thrown exception:

```cpp
void someFunction()
{
    Resource* ptr = new Resource();
    int x;
    std::cin >> x;
    if (x == 0)
        return;                  // ⚠️ ptr never deleted → leak
    // ...
    delete ptr;
}
```

```cpp
void someFunction()
{
    Resource* ptr = new Resource();
    int x;
    std::cin >> x;
    if (x == 0)
        throw 0;                 // ⚠️ ptr never deleted → leak
    // ...
    delete ptr;
}
```

The root cause: **raw pointer variables have no inherent cleanup mechanism**. If control leaves the function before the `delete`, the heap memory is leaked.

### 7.2 The RAII insight

> Classes contain destructors that run automatically when an object goes out of scope. If we wrap the pointer in a class whose destructor deletes it, we get cleanup **for free**.

This is the heart of **RAII** (Resource Acquisition Is Initialization, from LearnCpp 19.3). Whatever resource you acquire in the constructor — heap memory, a file handle, a network socket — is released in the destructor. Local objects always destruct, so resources always release.

### 7.3 First draft: a hand-rolled smart pointer

LearnCpp 22.1 shows what a minimal "owning pointer" class looks like:

```cpp
#include <iostream>

template <typename T>
class Auto_ptr1
{
    T* m_ptr{};
public:
    Auto_ptr1(T* ptr = nullptr) : m_ptr(ptr) {}
    ~Auto_ptr1() { delete m_ptr; }                 // ← the magic: cleanup in dtor

    T& operator*()  const { return *m_ptr; }
    T* operator->() const { return  m_ptr; }
};

class Resource {
public:
    Resource()  { std::cout << "Resource acquired\n"; }
    ~Resource() { std::cout << "Resource destroyed\n"; }
};

int main()
{
    Auto_ptr1<Resource> res(new Resource());   // ← no manual delete needed
    return 0;
} // res goes out of scope → ~Auto_ptr1 → delete m_ptr → ~Resource
```

Output:

```
Resource acquired
Resource destroyed
```

> 💡 **Definition** — A **smart pointer** is a composition class that manages a dynamically-allocated resource and ensures the resource is deleted when the smart pointer goes out of scope. (Raw pointers, by contrast, are sometimes called "**dumb pointers**".)

If `someFunction` from Section 7.1 uses an `Auto_ptr1` instead of a raw pointer, the leak vanishes — even on early return or exception:

```cpp
void someFunction()
{
    Auto_ptr1<Resource> ptr(new Resource());
    int x;
    std::cin >> x;
    if (x == 0) return;          // ptr.~Auto_ptr1() still runs, frees Resource
    ptr->sayHi();
}
```

### 7.4 The critical flaw — shallow copies

`Auto_ptr1` looks great until you copy it:

```cpp
Auto_ptr1<Resource> res1(new Resource());
Auto_ptr1<Resource> res2(res1);   // default copy ctor: shallow copy!
// Both res1 and res2 point at the same Resource.
// When both go out of scope → delete called twice on the same pointer → UB.
```

Output:

```
Resource acquired
Resource destroyed
Resource destroyed   ← second delete is UB; likely crashes
```

The same problem strikes when you pass `Auto_ptr1` to a function by value. (Recall **Rule of Three** from Week 4: if you have a raw pointer and a destructor that does `delete`, you must write the copy constructor and copy assignment yourself.)

### 7.5 Three options for fixing the copy problem

1. **Delete copy.** Make `Auto_ptr1` non-copyable. Safe, but then you can't return one from a factory function.
2. **Deep copy.** Make the copy constructor allocate a new `Resource` and copy the contents. Safe, but copying defeats the point of using a pointer (you wanted to *share* the object, not duplicate it).
3. **Move ownership.** When you "copy" `res1` to `res2`, transfer ownership: `res2` now owns the resource, `res1` is left empty. This is **move semantics**.

### 7.6 Move semantics — the C++11 idea

> **Move semantics**: the class transfers ownership of its managed resource rather than making a copy.

LearnCpp 22.1's `Auto_ptr2` demonstrates the idea using **non-const** copy operations (the actual move constructor / move assignment didn't exist yet in the abstract). The two important lines:

```cpp
Auto_ptr2(Auto_ptr2& a)               // copy ctor with move semantics — note: NOT const
{
    m_ptr   = a.m_ptr;                // steal the pointer
    a.m_ptr = nullptr;                // ⚠️ source is reset — critical!
}

Auto_ptr2& operator=(Auto_ptr2& a)    // copy assign with move semantics
{
    if (&a == this) return *this;
    delete m_ptr;                     // release current resource first
    m_ptr   = a.m_ptr;                // steal
    a.m_ptr = nullptr;                // reset source
    return *this;
}
```

> ⚠️ **Klefstad's emphasis** — the line `a.m_ptr = nullptr` (or `other.buf = nullptr` in the Week 4 String homework) is the **most error-prone line** in any move implementation. Forget it, and the source's destructor will delete the resource you just transferred away.

Output of the `Auto_ptr2` test program:

```
Resource acquired
res1 is not null
res2 is null
Ownership transferred
res1 is null
res2 is not null
Resource destroyed   ← only one Resource lifetime, no double-delete
```

### 7.7 `std::auto_ptr` — the historical mistake

C++98 shipped a smart pointer with exactly the design above: **`std::auto_ptr`**. C++11 deprecated it; C++17 removed it. Three reasons it failed (LearnCpp 22.1):

1. **Move semantics through the copy constructor is dangerous.** Passing `std::auto_ptr` by value silently transferred ownership to the function; the caller didn't realize their pointer was now empty. Then they dereferenced it → crash.
2. **`auto_ptr` always uses non-array `delete`.** Construct one with `new int[10]`, and the destructor calls `delete` (not `delete[]`) → UB.
3. **`auto_ptr` doesn't compose with STL containers / algorithms.** Standard library code assumed copying made a real copy; with `auto_ptr` it didn't.

> 💡 **The core problem (LearnCpp)** — "Prior to C++11, the language simply had no mechanism to differentiate **copy semantics** from **move semantics**. Overriding copy semantics to implement move semantics leads to weird edge cases and inadvertent bugs."

C++11 formally added **move semantics** (covered Week 4): rvalue references, `&&`, `std::move`. Now we can have a copy constructor *and* a move constructor, and the compiler picks the right one based on whether the source is an lvalue or an rvalue. That made it possible to write `std::unique_ptr` and `std::shared_ptr` correctly.

### 7.8 Klefstad PPT slide 5 — the smart pointer landscape

> Topic 9 PPT slide 5 summary:
> - **`shared_ptr<>`** — allows **sharing** pointers to a single object. The heap object is deleted when the **last** pointer dies, or is moved away.
>   - Factory: `auto sp = std::make_shared<int>(42);` instead of `int* p = new int{42};`
> - **`unique_ptr<>`** — enforces **no other pointers** to the object. The heap object is deleted when the `unique_ptr` dies.
>   - **Deletes the copy constructor and copy assignment.**
>   - May use **`std::move()`** to transfer the pointer.

C++11 added four smart pointer types in `<memory>`:

| Smart pointer | Ownership model |
|---|---|
| `std::auto_ptr` | (removed in C++17) — don't use |
| `std::unique_ptr` | Sole ownership; non-copyable, movable |
| `std::shared_ptr` | Shared ownership via reference counting; copyable and movable |
| `std::weak_ptr` | Non-owning observer of a `shared_ptr` (breaks reference cycles) |

The next two sections cover the two most common — `unique_ptr` and `shared_ptr`.

---

## 8. `std::unique_ptr`

> Corresponds to LearnCpp 22.5 + Topic 9 PPT slides 5, 6, 8

### 8.1 The key idea

> `std::unique_ptr` should be used to manage any **dynamically allocated object that is not shared** by multiple objects. That is, `std::unique_ptr` should **completely own** the object it manages.

Properties:

- Lives in `<memory>`.
- **Copy constructor and copy assignment are deleted** — you cannot accidentally duplicate ownership.
- **Move constructor and move assignment are provided** — you transfer ownership with `std::move`.
- The destructor `delete`s the managed object (or `delete[]`s, for the array form).

### 8.2 Basic example

```cpp
#include <iostream>
#include <memory>

class Resource {
public:
    Resource()  { std::cout << "Resource acquired\n";  }
    ~Resource() { std::cout << "Resource destroyed\n"; }
};

int main()
{
    std::unique_ptr<Resource> res{ new Resource() };
    return 0;
} // res goes out of scope → Resource deleted
```

Output:

```
Resource acquired
Resource destroyed
```

> ⚠️ **Allocate smart pointers on the stack, never on the heap.** A heap-allocated `unique_ptr` defeats the purpose — *you* would have to remember to delete the `unique_ptr` itself, restarting the leak problem you were trying to solve. Always make smart pointers local variables or class data members.

### 8.3 Move semantics — copying is disabled

```cpp
#include <iostream>
#include <memory>
#include <utility>     // std::move

int main()
{
    std::unique_ptr<Resource> res1{ new Resource{} };
    std::unique_ptr<Resource> res2{};

    std::cout << "res1 is " << (res1 ? "not null\n" : "null\n");
    std::cout << "res2 is " << (res2 ? "not null\n" : "null\n");

    // res2 = res1;                 // ❌ won't compile: copy assignment is deleted
    res2 = std::move(res1);          // ✓  move assignment — res2 takes ownership

    std::cout << "Ownership transferred\n";
    std::cout << "res1 is " << (res1 ? "not null\n" : "null\n");
    std::cout << "res2 is " << (res2 ? "not null\n" : "null\n");
}
```

Output:

```
Resource acquired
res1 is not null
res2 is null
Ownership transferred
res1 is null
res2 is not null
Resource destroyed     ← only once, when res2 dies
```

> 💡 **The cast-to-bool**: `if (res)` is `true` when the unique_ptr owns a resource. Always check before dereferencing.

### 8.4 Access — `*`, `->`, and `get()`

```cpp
std::unique_ptr<Resource> res{ new Resource{} };

if (res)
    std::cout << *res << '\n';     // operator* → Resource&

if (res)
    res->doSomething();            // operator-> → Resource*
```

If you need to pass the raw pointer to existing code that doesn't know about smart pointers, use `.get()`:

```cpp
void useResource(const Resource* p) { if (p) std::cout << *p; }

auto ptr = std::make_unique<Resource>();
useResource(ptr.get());            // ✓ ptr keeps ownership
```

### 8.5 Arrays — supported (unlike `auto_ptr`)

```cpp
auto p = std::make_unique<int[]>(10);   // dynamic array of 10 ints
p[0] = 1;
```

`unique_ptr` is template-specialized to call `delete[]` instead of `delete` for the array form.

> ⚠️ **Best practice (LearnCpp 22.5)** — Favor `std::array`, `std::vector`, or `std::string` over a smart pointer managing a fixed array, dynamic array, or C-style string. The container types are higher level and easier to use.

### 8.6 `std::make_unique` (C++14) — strongly preferred

```cpp
auto f1 = std::make_unique<Fraction>(3, 5);   // Fraction(3, 5) on the heap, owned by unique_ptr
auto f2 = std::make_unique<Fraction[]>(4);    // array of 4 default-constructed Fractions
```

> ⚠️ **Best practice (LearnCpp 22.5)** — **Use `std::make_unique()` instead of constructing `std::unique_ptr` from `new` yourself.** It's simpler, requires less typing (you don't repeat the type name), and works correctly with `auto`. It also fixes a subtle exception-safety bug…

#### The exception-safety issue (C++14 and earlier)

```cpp
some_function(std::unique_ptr<T>(new T),
              function_that_can_throw_exception());
```

The compiler is free to reorder this as:

1. `new T`
2. `function_that_can_throw_exception()`   ← throws here
3. (never reached) `std::unique_ptr<T>(...)`

If step 2 throws, the `T` allocated in step 1 leaks because no `unique_ptr` was constructed to own it. `std::make_unique` packs the allocation and ownership into one indivisible operation:

```cpp
some_function(std::make_unique<T>(),
              function_that_can_throw_exception());   // safe in all C++ versions
```

> 💡 **Fixed in C++17** — function-argument evaluation order is now restricted, eliminating this bug. But `make_unique` is still preferred for clarity.

### 8.7 Returning `unique_ptr` from a function

```cpp
std::unique_ptr<Resource> createResource()
{
    return std::make_unique<Resource>();
}

int main()
{
    auto ptr = createResource();   // OK: move (or RVO/NRVO)
}
```

This works because returning a local automatic variable triggers either **return-value optimization** (the unique_ptr is constructed directly in the caller's storage, no copy/move needed) or, failing that, a **move** (which `unique_ptr` supports).

> 💡 **Best practice** — return `unique_ptr` by **value**, never by pointer or reference (a reference would dangle; a pointer would defeat the purpose).

### 8.8 Passing `unique_ptr` to a function

You have to be explicit about whether you are *transferring ownership* or just *lending the object*:

#### To transfer ownership: pass by value with `std::move`

```cpp
void takeOwnership(std::unique_ptr<Resource> res)
{
    if (res) std::cout << *res << '\n';
}   // res destroyed here → Resource deallocated here

int main()
{
    auto ptr = std::make_unique<Resource>();
    takeOwnership(std::move(ptr));         // ✓ ownership moves into the function
    // ptr is now null
}
```

#### To lend the object: pass the raw pointer (via `.get()`)

```cpp
void useResource(const Resource* r) { /* read-only use */ }

auto ptr = std::make_unique<Resource>();
useResource(ptr.get());                    // function does not see the smart pointer at all
```

> 💡 **Why pass the raw pointer instead of the `unique_ptr&`?** Because the called function may not care that its caller uses smart pointers. Lower coupling → easier to reuse.

### 8.9 `unique_ptr` as a class member

```cpp
class Owner {
    std::unique_ptr<Resource> m_res = std::make_unique<Resource>();
public:
    // No need to write a destructor! ~Owner() default destructs m_res, which deletes the Resource.
};
```

This is the **RAII payoff**: if every owned-pointer member is a `unique_ptr`, your class doesn't need a custom destructor (and Rule of Three/Five reduces to "= default" or "= delete").

### 8.10 Common misuses (LearnCpp 22.5)

```cpp
Resource* res = new Resource();
std::unique_ptr<Resource> u1{ res };
std::unique_ptr<Resource> u2{ res };   // ⚠️ both will delete res → UB
```

```cpp
Resource* res = new Resource();
std::unique_ptr<Resource> u1{ res };
delete res;                            // ⚠️ unique_ptr will delete it again → UB
```

`std::make_unique` prevents both — it allocates inside, and you never get a chance to make a second `unique_ptr` from the same raw pointer.

### 8.11 Klefstad PPT slide 6 — linked list with `unique_ptr`

This is one of the most instructive examples in the PPT. A linked list where each `next` is a `unique_ptr<Node>`:

```cpp
struct List {
    struct Node {
        int data;
        std::unique_ptr<Node> next;
    };
    std::unique_ptr<Node> head;

    ~List() {
        // Manual iterative destruction to avoid recursive ~Node() stack overflow
        while (head != nullptr) {
            auto next = std::move(head->next);
            head      = std::move(next);
        }
    }

    void push(int data) {
        // head = std::unique_ptr<Node>( new Node{data, std::move(head)} );
        head = std::make_unique<Node>( data, std::move(head) );
    }
};
// ⚠️ iterators may not point at our lists if we used unique_ptr!!
```

A few things to unpack:

1. **`head` owns the first node; each `next` owns the rest.** Because each `Node` is owned by exactly one `unique_ptr`, there are no shared owners — perfect for `unique_ptr`'s single-ownership model.
2. **Why a manual destructor?** If you let the default destructor run, `~List()` would destroy `head`, which would destroy `head->next`, which would destroy `head->next->next`, and so on **recursively**. A 1,000,000-node list would blow the call stack. The manual `while` loop transfers ownership node by node, so destruction is **iterative**.
3. **`std::move(head)` in `push`** — when we create a new head node, we transfer the current `head` into its `next` field. After the move, the temporary `unique_ptr` is null, then we assign the new node back to `head`. Net effect: prepend.
4. ⚠️ **Klefstad's warning at the bottom**: "**iterators may not point at our lists if we used `unique_ptr`!!**" Why? Because an iterator typically stores a `Node*` or `unique_ptr<Node>*`. If you store a raw `Node*`, you violate `unique_ptr`'s single-ownership invariant (multiple things now access the same node — the `unique_ptr` for cleanup, the iterator for traversal — but the iterator must not delete). The contract is weakened.

Compare with the same list using `shared_ptr` (Section 9.4): no such restriction.

### 8.12 Python → C++ contrast

| Aspect | Python | C++ |
|---|---|---|
| Default ownership | Garbage-collected; every reference shares ownership | Manual; raw pointer means no ownership |
| Equivalent to `unique_ptr` | None directly; `weakref` is opposite (non-owning) | `std::unique_ptr<T>` |
| Equivalent to `shared_ptr` | All Python references are "shared", roughly | `std::shared_ptr<T>` |
| Memory cleanup | Reference count + cycle collector | Destructor (deterministic, RAII) |

---

## 9. `std::shared_ptr`

> Corresponds to LearnCpp 22.6 + Topic 9 PPT slides 5, 7, 8

### 9.1 The key idea

Where `unique_ptr` is for **sole** ownership, `std::shared_ptr` solves the case where **multiple smart pointers co-own the same resource**.

- Internally, `shared_ptr` keeps a **reference count** — how many `shared_ptr`s currently point at the resource.
- As long as the count is ≥ 1, the resource lives.
- When the **last** `shared_ptr` is destroyed (or reassigned), the count drops to 0 and the resource is deleted.

`shared_ptr` lives in `<memory>` (same header as `unique_ptr`).

### 9.2 Basic example — sharing works

```cpp
#include <iostream>
#include <memory>

class Resource {
public:
    Resource()  { std::cout << "Resource acquired\n"; }
    ~Resource() { std::cout << "Resource destroyed\n"; }
};

int main()
{
    Resource* res{ new Resource };
    std::shared_ptr<Resource> ptr1{ res };
    {
        std::shared_ptr<Resource> ptr2{ ptr1 };   // copy-construct from ptr1
        std::cout << "Killing one shared pointer\n";
    }   // ptr2 dies, count goes 2→1, Resource still alive

    std::cout << "Killing another shared pointer\n";
    return 0;
}   // ptr1 dies, count goes 1→0, Resource deleted
```

Output:

```
Resource acquired
Killing one shared pointer
Killing another shared pointer
Resource destroyed
```

### 9.3 The dangerous mistake — independent `shared_ptr`s

```cpp
Resource* res{ new Resource };
std::shared_ptr<Resource> ptr1{ res };       // ptr1 thinks count = 1
{
    std::shared_ptr<Resource> ptr2{ res };   // ⚠️ ptr2 made independently from raw → its OWN count = 1
    std::cout << "Killing one shared pointer\n";
}   // ptr2 dies, ITS count goes 0 → Resource deleted (!)
std::cout << "Killing another shared pointer\n";
// ptr1 dies, ITS count goes 0 → Resource deleted AGAIN → UB
```

Output (then crashes):

```
Resource acquired
Killing one shared pointer
Resource destroyed
Killing another shared pointer
Resource destroyed       ← second delete, UB
```

Why does this happen? Each `shared_ptr` has its **own control block** — a tiny dynamically-allocated record that holds the reference count. When you construct two `shared_ptr`s **independently** from the same raw pointer, each one allocates its own control block, and they don't know about each other.

> ⚠️ **Best practice (LearnCpp 22.6)** — Always make a **copy** of an existing `shared_ptr` if you need more than one `shared_ptr` pointing to the same resource. The copy correctly shares the same control block.

### 9.4 `std::make_shared` — preferred (and faster)

```cpp
auto ptr1{ std::make_shared<Resource>() };   // allocates Resource + control block (often in one allocation)
{
    auto ptr2{ ptr1 };                       // copy → shares the same control block, count = 2
}                                             // ptr2 dies, count = 1
                                              // ptr1 dies at end of main, count = 0 → Resource deleted
```

Two reasons `make_shared` is the default:

1. **Safety.** You never have a raw pointer in scope, so it is impossible to make two independent `shared_ptr`s from the same raw pointer.
2. **Performance.** A directly-constructed `shared_ptr` allocates the managed object **and** the control block **separately**. `make_shared` can fold them into a **single allocation** — fewer trips to the heap, better cache locality.

### 9.5 Under the hood — the control block

`shared_ptr` actually contains **two** pointers internally:

| Pointer | Points at |
|---|---|
| The managed object pointer | The resource |
| The control block pointer | A heap-allocated struct holding: ref count, weak count, deleter, allocator |

When you copy a `shared_ptr`, only **both pointers** are copied (cheap), and the **count in the control block is bumped**. When a `shared_ptr` is destroyed, the count is decremented; if it hits 0, the control block tells the resource to be deleted.

> 💡 **Why `make_shared` is faster** — separate `new Resource` + separate `new ControlBlock` = two allocations. `make_shared` carves out one big chunk for both → one allocation. On a hot path that creates many `shared_ptr`s, this matters.

### 9.6 Converting `unique_ptr` → `shared_ptr` (one-way)

```cpp
std::unique_ptr<int> u = std::make_unique<int>(42);
std::shared_ptr<int> s = std::move(u);   // OK: special ctor moves from unique_ptr
```

You **cannot** safely convert the other direction (a `shared_ptr` may have other co-owners; you can't unilaterally make ownership sole).

> 💡 **Design heuristic (LearnCpp 22.6)** — if your factory function might return ownership that the caller could later want to share, return `unique_ptr`. The caller can move-construct a `shared_ptr` from it. The opposite — return `shared_ptr` — is forced: the caller now has to live with reference counting whether they want to or not.

### 9.7 Pitfalls (LearnCpp 22.6)

- **Improper disposal of any `shared_ptr` leaks the resource.** With `unique_ptr`, there is exactly one smart pointer to worry about. With `shared_ptr`, you must ensure **every** owner is properly destroyed; even one stuck in a leaked container, or held by a forgotten heap object, will keep the count from reaching zero.
- **Arrays support is incomplete pre-C++20.** Use `std::shared_ptr<T[]>` with a custom deleter pre-C++20; the standard syntax is fixed in C++20.
- **Reference cycles cause leaks** — if `A` holds `shared_ptr<B>` and `B` holds `shared_ptr<A>`, neither count ever reaches zero. The remedy is `std::weak_ptr` (out of scope for Week 9 reading but mentioned in Section 7.8).

### 9.8 Klefstad PPT slide 7 — linked list with `shared_ptr`

```cpp
struct List {
    struct Node {
        int data;
        std::shared_ptr<Node> next;
    };
    std::shared_ptr<Node> head;

    void push(int data) {
        // head = std::shared_ptr<Node>( new Node{data, head} );
        head = std::make_shared<Node>( data, head );
    }
};
```

Compared to the `unique_ptr` version (Section 8.11):

| | `unique_ptr` version | `shared_ptr` version |
|---|---|---|
| Storage | `unique_ptr<Node>` for `head` and `next` | `shared_ptr<Node>` for `head` and `next` |
| Destructor | Custom iterative loop required (to avoid recursive stack overflow) | **Default** is fine — but careful with very long lists, the recursive destruction can still overflow the stack |
| `push` | `std::move(head)` into the new node's `next` | Just `head` — the `shared_ptr` copy bumps the refcount |
| Iterators | ⚠️ Cannot share node pointers without violating uniqueness | ✓ Iterators can hold `shared_ptr<Node>` or raw `Node*` |

> 💡 **Trade-offs**:
> - `unique_ptr` is **cheaper** (no atomic refcount, no control block) and statically enforces single ownership.
> - `shared_ptr` is **more flexible** (iterators are unproblematic, you can have multiple "handles" into the list) but adds runtime cost (atomic refcount bumps on every copy/destruct).

> ⚠️ **Klefstad's "iterators may not point at our lists if we used unique_ptr"** — this is exactly why HW9's `SetList` uses **raw `ListNode*`** internally, not `unique_ptr<ListNode>`. The container itself manages cleanup in its destructor; iterators are free to point wherever.

---

## 10. Designing Classes That Use STL (Klefstad's "Using STL")

> Corresponds to Topic 9 PPT slide 8. No direct LearnCpp reading; the underlying ideas (Rule of Three/Five, `= default`/`= delete`) come from earlier chapters and are reinforced by 22.1.

Klefstad's slide 8 poses several questions about a class whose data members are all "proper STL types" (`std::string`, `std::vector`, `std::set`, `std::map`, …):

### 10.1 If your class uses only STL types, what must you write?

> **Constructors, assignments, destructors — which of these do you need to write?**

If every data member is a well-behaved value type (no raw pointers, no manually-managed resources), the answer is:

- **Default constructor**: usually you can leave it implicit, unless you need to initialize members to specific values.
- **Destructor**: you can leave it implicit. The compiler-generated destructor calls each member's destructor in reverse declaration order — and `std::vector::~vector()`, `std::string::~string()`, etc. all clean up correctly.
- **Copy constructor**: implicit — does a memberwise copy. Each member's own copy constructor (deep copy for `vector`, `string`, …) is invoked.
- **Copy assignment**: implicit — memberwise assignment. Works correctly for the same reason.
- **Move constructor / assignment**: implicit if you don't suppress them (no user-defined dtor/copy/move). The compiler generates memberwise moves.

### 10.2 What are the defaults — `= delete` or `= default`?

> Klefstad's slide poses: "What are the defaults? `= delete` or `= default`?"

The compiler's "implicit" generation can either provide a default or *delete* the function. It deletes when the member layout makes a default impossible (e.g., a member has no copy constructor, or a `const` member can't be assigned). Otherwise it generates `= default`.

You can take control by writing `= default` or `= delete` explicitly. Examples we've seen:

```cpp
class Widget {
public:
    Widget() = default;                         // explicit "give me the implicit default"
    Widget(const Widget&) = delete;             // explicitly disable copy
    Widget& operator=(const Widget&) = delete;
};
```

> ⚠️ **Rule of Zero** — if all your members are well-behaved value types, write none of the special members and let the compiler handle everything. This is the cleanest, most maintainable design when you can swing it.

### 10.3 What about pointers to heap storage? (HW 4, 5, 6, 7)

> Klefstad: "what about pointers to heap storage (HW4,5,6,7)? can we use shared_ptr or unique_ptr?"

In HW4 (heap String), HW5 (linked-list String), HW6 (Picture container of Shape*), HW7 (further extensions), the data members were **raw pointers** — so Rule of Three or Rule of Five applied, and you wrote 3–5 special members by hand.

**The smart-pointer answer**: replace each raw pointer with a `unique_ptr` (sole ownership) or `shared_ptr` (shared ownership), and the special members reduce to `= default` or even disappear:

```cpp
// Old (HW6 Picture)
class Picture {
    Shape** shapes;
    int size;
    // Rule of Five: dtor, copy ctor, copy assign, move ctor, move assign
};

// New (smart-pointer version)
class Picture {
    std::vector<std::unique_ptr<Shape>> shapes;
    // Rule of Zero! No special members needed.
    // ~Picture() destroys the vector, which destroys each unique_ptr, which deletes each Shape.
};
```

> 💡 **Klefstad's pedagogical point** — the homework had you implement Rule of Three by hand because you have to understand the mechanism. Now that you do, in real code you use smart pointers and STL containers and let the compiler write the Rule of Zero for you.

---
## 11. C++20 Ranges and Views

> Corresponds to Topic 9 PPT slides 2–4 + Topic 8 PPT slide 25.
> ⚠️ **Cross-week note** — Topic 8 PPT slide 25 briefly introduces ranges in the context of Week 8's "algorithms take iterator pairs" idea; Topic 9 expands on it with views and a worked LeetCode example. The Week 9 Assigned Reading does **not** explicitly cover ranges (the bullet was on the Week 8 cheat-sheet's "look ahead"), but the topic clearly lives across Weeks 8–9, so it is here for completeness.

### 11.1 What is a range?

> **A range is just a `(begin(), end())` pair**, viewed as a single thing.

Every STL container already exposes `begin()` and `end()`, so every container is implicitly a range. C++20 makes this explicit and gives algorithms a version that accepts a whole range as one argument:

```cpp
// Pre-C++20 (still works):
std::sort(v.begin(), v.end());

// C++20 range overload:
std::ranges::sort(v);              // shorter, less error-prone (no chance to mix begin1 / end2)
```

The `std::ranges::*` versions of algorithms live in `<algorithm>` and `<ranges>`.

### 11.2 What is a view?

> **A view is a lightweight, non-owning range** that lazily transforms or filters the elements of another range as you iterate.

Views live in `std::ranges::views` (often abbreviated `std::views`). They are **composable**: you pipe them together with `|`, just like Unix shell pipelines.

> 💡 **Two crucial properties**:
> - **Lazy**: a view doesn't compute anything until you iterate it. `views::filter(...)` doesn't loop through the source; only the next `*iter` does.
> - **Non-owning**: a view is cheap to copy — it stores at most a `begin/end` pair, not the data itself. Like `std::string_view` and `std::initializer_list`.

### 11.3 Klefstad PPT slide 3 — `views::filter` and `views::transform`

```cpp
#include <vector>
#include <ranges>
#include <iostream>

vector<int> v = {1, 2, 3, 4};

// views::filter — keep only elements satisfying a predicate
auto x = views::filter(v, [](int i) { return i % 2 == 0; });
for (int i : x)
    cout << i << ' ';        // prints: 2 4

// views::transform — apply a function to each element (lazily)
// Composed with | onto the previous view
auto y = x | views::transform([](int i) { return 2 * i; });
for (int i : y)
    cout << i << ' ';        // prints: 4 8
```

What just happened:

- `x` is a **view** over `v` that yields only even numbers. Iterating `x` walks `v` element-by-element, skipping the odd ones.
- `y` is a view composed of `x` *and* a transform. Iterating `y` walks `x` (which walks `v`, skipping odds), and for each survivor multiplies it by 2.
- `v` is **never modified** and **never copied**. All the work is lazy.

The `|` syntax is read right-to-left in terms of when things happen, but reads naturally left-to-right as a pipeline.

### 11.4 Klefstad PPT slide 4 — Ranges Example (LC125 Valid Palindrome)

The LeetCode 125 problem: given a string, return `true` if it is a palindrome ignoring case and non-alphanumeric characters.

```cpp
bool is_palindrome(std::string const& s)
{
    auto v = s
        | views::filter   ([](char c){ return std::isalnum(c); })
        | views::transform([](char c){ return std::tolower(c); });

    return ranges::equal(v, views::reverse(v));
}
```

What this does, step by step:

1. **`s | views::filter(...)`** — a view over `s` that yields only alphanumeric characters.
2. **`| views::transform(...)`** — a view that lowercases each survivor as it's yielded.
3. **`views::reverse(v)`** — a view that yields the elements of `v` in reverse order.
4. **`ranges::equal(v, views::reverse(v))`** — true iff the forward iteration matches the reverse iteration.

> 💡 **Why this is beautiful**: zero allocations, no intermediate string, no manual loop, no off-by-one indexing. The algorithm reads exactly like the English specification.

> ⚠️ **Compiler support**: ranges require C++20 and reasonably recent compiler versions. Make sure your build uses `-std=c++20` (or `c++2a`).

### 11.5 PPT slide 2 — ranges live in `std::ranges`, views in `std::ranges::views`

> Topic 9 PPT slide 2 condensed:
> - **ranges** are `begin() .. end()`
> - algorithms are defined in **`std::ranges`** (e.g., `std::ranges::sort`, `std::ranges::find`)
> - **views** are lightweight ranges
> - view operations are in **`std::ranges::views`** (often aliased as `std::views`)
> - views are **composable with `|`**
> - tutorial link: [hannes.hauswedell.net/post/2019/11/30/range_intro](https://hannes.hauswedell.net/post/2019/11/30/range_intro/) (per PPT)

### 11.6 What's in `<ranges>` (selected list)

| View | What it produces |
|---|---|
| `views::filter(pred)` | Elements for which `pred` returns true |
| `views::transform(fn)` | Each element with `fn` applied |
| `views::take(n)` | The first n elements |
| `views::drop(n)` | All but the first n elements |
| `views::reverse` | Elements in reverse order |
| `views::iota(a, b)` | The integers a, a+1, …, b-1 (generated, no storage) |
| `views::keys` / `views::values` | First/second of each `pair` (e.g. for `std::map`) |
| `views::split(delim)` | Split a range on a delimiter |
| `views::join` | Flatten a range of ranges |

> 💡 **`std::ranges::sort(v)`** is *eager* — it modifies `v`. Compare with `views::reverse(v)`, which is *lazy* and creates a non-owning view. Algorithms eager, views lazy.

---

## 12. HW9 — Implementing `SetList` and `MapArray` Containers

> Corresponds to Topic 9 PPT slides 9, 11.
> ⚠️ **This is HW9 spec material — Klefstad-specific, not in any LearnCpp chapter.**

### 12.1 Incremental development plan (PPT slide 9)

Klefstad lays out a careful workflow for HW9. Read it carefully — sticking to the order avoids most painful debugging sessions.

```
1. Start with a working "mapset" program from HW8 (used std::set and std::map).
2. Code SetList container + forward iterator (this is your first new piece).
3. Test SetList with simple test cases (gtest).
4. Modify mapset: replace std::set with SetList.
   • Let the compiler tell you what methods are still missing on SetList.
5. Test the modified mapset until it fully works.
6. Now revert SetList → std::set and replace std::map with MapArray.
   • Same idea: compile against the partial MapArray and fix what's missing.
7. Repeat tests until mapset works with MapArray.
8. Finally, use SetList AND MapArray together. Test again.
9. Autograder runs more gtests for SetList and MapArray.
```

> 💡 **Klefstad's pedagogy** — you build each piece independently, plug them in one at a time, and let the compiler errors guide you to what's missing. Don't try to write `SetList` and `MapArray` both from scratch and then "see if it compiles" — debugging two new components at once will eat hours.

> ⚠️ **What "mapset" is** — short for the small `map<key, set<value>>`-style program from HW8 (sometimes called "word-frequency" or "inverted-index" depending on the variant). The point: you have a *working* test harness whose only job is to exercise `set` and `map`.

### 12.2 The simplest container — Klefstad's `Array.cpp`

PPT slide 10 ("Template Class Array — One complete example of the simplest container — a wrapper around a C-array — Array.cpp") refers to an example file Klefstad shows in class. Conceptually it is the templated version of LearnCpp's `IntArray` (Section 2):

```cpp
template <typename T>
class Array {
    T*  data{};
    int length{};
public:
    Array() = default;
    Array(int n) : data{ new T[n]{} }, length{ n } {}
    ~Array() { delete[] data; }

    Array(const Array&)            = delete;
    Array& operator=(const Array&) = delete;

    T&  operator[](int i)         { return data[i]; }
    int size() const              { return length;  }
};
```

This is the *base camp*. From here you extend in two directions:

- Add iterators, copy ctor, etc. → you get `std::vector`-like sequence containers.
- Add unique-keys semantics on top of a linked list → you get `SetList`.
- Add key/value pairs on top of a sorted vector → you get `MapArray`.

### 12.3 `SetList<T>` — class structure (PPT slide 11)

```cpp
template <typename T>
struct SetList {
    using value_type = T;
    using pointer    = value_type*;
    using reference  = value_type&;

    struct ListNode {
        value_type data;
        ListNode * next;
    };

    // head = new ListNode{D, head};      // (push at front pattern; see Notes below)

    SetList();
    ~SetList();

    iterator insert(reference val);       // returns iterator to inserted (or existing) node
    iterator find  (reference val);       // returns iterator to node, or end() if not found
    iterator erase (iterator pos);        // erases node at pos, returns next iterator

    int size() const;

    iterator begin() const;
    iterator end()   const;

private:
    ListNode * head;                      // raw pointer — SetList owns the chain
};
```

> 💡 **Why raw `ListNode*` and not `unique_ptr<ListNode>`?** Klefstad's PPT slide 6 footnote: "iterators may not point at our lists if we used `unique_ptr`!!" An iterator stores a `ListNode*` to its current node. If the chain were `unique_ptr`-linked, iterators would be aliasing those `unique_ptr`s, breaking single-ownership. With raw pointers the **container** owns everything; iterators just observe.

### 12.4 `SetList` member-by-member

#### Type aliases — the "I'm a container" handshake

```cpp
using value_type = T;
using pointer    = value_type*;
using reference  = value_type&;
```

These are STL conventions. `std::iterator_traits` (and generic algorithms like `std::find`) introspect a container or iterator by asking for these typedefs. By providing them, your container/iterator becomes interoperable with STL machinery.

> ⚠️ **Klefstad-naming convention** — note that Klefstad uses `ListNode` with members named `data` and `next`. Stick to these names; the autograder may rely on them.

#### `struct ListNode { value_type data; ListNode * next; };`

Each node holds:
- `data`: the actual element value
- `next`: a raw pointer to the next node, or `nullptr` at the end

> 💡 **Klefstad's autograder cue** — the linked-list node MUST be named `ListNode` (per PPT) with members `data` and `next`. Don't rename them.

#### `SetList()` — empty list

```cpp
SetList() : head{ nullptr } {}
// or: SetList() = default;   if you initialize head{} in the class body
```

#### `~SetList()` — delete every node

```cpp
~SetList() {
    while (head != nullptr) {
        ListNode* tmp = head;
        head = head->next;
        delete tmp;
    }
}
```

> ⚠️ **Iterative, not recursive.** A recursive destructor for a million-node list overflows the call stack. Iterate.

#### `insert(reference val)` — unique-keys insertion

Because `SetList` represents a *set*, duplicates are not allowed. The standard pattern:

```cpp
iterator insert(reference val) {
    // 1. Search: walk the list. If found, return iterator to existing node.
    for (ListNode* cur = head; cur != nullptr; cur = cur->next)
        if (cur->data == val) return iterator(cur);

    // 2. Not found: prepend new node at head.
    head = new ListNode{ val, head };     // Klefstad's "head = new ListNode{D, head};"
    return iterator(head);
}
```

> 💡 **Why prepend instead of append?** O(1) instead of O(n). Order in a set is irrelevant (it's a set, not a sequence), so prepending is the natural choice. The PPT's hint `// head = new ListNode{D, head};` shows exactly this.

#### `find(reference val)` — linear search

```cpp
iterator find(reference val) {
    for (ListNode* cur = head; cur != nullptr; cur = cur->next)
        if (cur->data == val) return iterator(cur);
    return end();
}
```

> ⚠️ **`find` returns `end()` if not found**, matching the STL convention. Callers check `if (it != s.end())` before dereferencing.

#### `erase(iterator pos)` — delete node, return next

```cpp
iterator erase(iterator pos) {
    // Need to find pos in the list to fix up the predecessor's next pointer.
    // (A doubly-linked list would store prev, making this O(1).
    //  Singly-linked → O(n) erase, unfortunately.)
    if (pos == end()) return end();

    ListNode* target = /* the node pos refers to */;
    if (head == target) {
        head = target->next;
        delete target;
        return iterator(head);
    }
    ListNode* prev = head;
    while (prev->next != target) prev = prev->next;
    prev->next = target->next;
    ListNode* nextNode = target->next;
    delete target;
    return iterator(nextNode);
}
```

> 💡 **STL convention** — `erase(pos)` returns the iterator just past the erased element. This is what makes the `it = c.erase(it)` idiom (Section 5.10) work.

#### `size() const` — count nodes

```cpp
int size() const {
    int n = 0;
    for (ListNode* cur = head; cur != nullptr; cur = cur->next) ++n;
    return n;
}
```

Or cache the size in a `count` member to make `size()` O(1) — your choice.

#### `begin() const` / `end() const`

```cpp
iterator begin() const { return iterator(head);    }
iterator end()   const { return iterator(nullptr); }
```

The end iterator is just a wrapped null pointer. That makes `it != end()` equivalent to `it.current != nullptr` — the same termination test as the raw-pointer loop.

> ⚠️ **`const` correctness** — `begin()`/`end()` are `const` because iteration doesn't mutate the container. The returned iterator is non-const (you can write through `*it`); make a separate `const_iterator` if you want read-only iteration.

---

## 13. Iterator `++`/`--` — The Universal Skeleton (and the Random-Access Extras)

Before implementing the two HW9 iterators concretely (`SetList`'s forward iterator in Section 14, `MapArray`'s random-access iterator in Section 15), it pays to see the **one pattern they both instantiate**. Across *every* iterator category, the increment/decrement operators have an identical shape — only the single "how do I take one step" line in the middle changes.

### 13.1 The fixed shell (tag-independent)

No matter the category, prefix and postfix always look like this:

```cpp
// Prefix ++ : take one step, return *this BY REFERENCE
Iter& operator++() {
    /* take one step */
    return *this;
}

// Postfix ++ : save the old value, reuse prefix, return the old copy
Iter operator++(int) {     // the dummy `int` only distinguishes the two overloads
    Iter temp = *this;     // 1. snapshot the old position
    ++(*this);             // 2. reuse prefix to do the real work
    return temp;           // 3. hand back the OLD value (by value)
}
```

`--` is the same skeleton with "take one step" replaced by "step backward."

Two rules that never change, regardless of tag:
- **Prefix returns a reference** (`Iter&`) to the iterator itself; **postfix returns a copy** (`Iter`, by value) of the old position.
- **Postfix is always "snapshot + call prefix + return the snapshot."** You never re-implement the movement logic in postfix — you delegate to prefix. This holds for `++` and `--`, in every category.

> 💡 This is why, once you've written prefix, postfix is mechanical copy-paste. It's also why `++it` is preferred over `it++` in loops: postfix builds and returns an extra throwaway copy.

### 13.2 By tag: which operators you write, and how "one step" works

The shell above is constant. What changes per category is (a) *which* operators you must provide and (b) what the "take one step" line actually does.

#### ① `forward_iterator` — only `++`, no `--`

The underlying structure is typically a **singly linked list** (HW9's `SetList`). You can only follow `next`; there is no way back, so there is **no `operator--`**.

```cpp
// member: ListNode* current;

Iter& operator++() {                 // "one step" = follow the next pointer
    current = current->next;
    return *this;
}
Iter operator++(int) { Iter t = *this; ++(*this); return t; }

// NO operator-- : forward doesn't require it, and a singly linked list can't do it
```

#### ② `bidirectional_iterator` — `++` and `--`, walking node pointers

The underlying structure is typically a **doubly linked list or tree** (the real `std::list` / `std::set` / `std::map`). Each node has both `prev` and `next`, so you can walk both ways — but still only **one node at a time**.

```cpp
// member: Node* ptr;

Iter& operator++() { ptr = ptr->next; return *this; }   // one step forward = follow next
Iter operator++(int) { Iter t = *this; ++(*this); return t; }

Iter& operator--() { ptr = ptr->prev; return *this; }   // one step back = follow prev
Iter operator--(int) { Iter t = *this; --(*this); return t; }
```

> Bidirectional adds **only** `--` over forward. There is still no `+ n` jump — to go back three, you call `--` three times.

#### ③ `random_access_iterator` — `++`/`--` **plus** `+= -= + -` `[]`, via pointer arithmetic

The underlying structure is **contiguous memory** (HW9's `MapArray`, whose member is a `pair*`). Now "one step" is no longer chasing a link — it's **address arithmetic**, and the same arithmetic generalizes to jumping by `n`:

```cpp
// member: std::pair<Key, Value>* current;   // difference_type = std::ptrdiff_t

// ++ / -- : single step (raw-pointer inc/dec already does the address math)
Iter& operator++() { ++current; return *this; }
Iter operator++(int) { Iter t = *this; ++current; return t; }
Iter& operator--() { --current; return *this; }
Iter operator--(int) { Iter t = *this; --current; return t; }

// jump by n — THIS is what random-access adds over bidirectional
Iter& operator+=(difference_type n) { current += n; return *this; }   // compound: mutate, return ref (like prefix ++)
Iter& operator-=(difference_type n) { current -= n; return *this; }

Iter operator+(difference_type n) const { Iter t = *this; t += n; return t; }  // copy, reuse +=, return copy (like postfix)
Iter operator-(difference_type n) const { Iter t = *this; t -= n; return t; }

// iterator − iterator → distance between them (O(1), random-access only)
difference_type operator-(const Iter& o) const { return current - o.current; }

// indexing
reference operator[](difference_type n) const { return current[n]; }
```

Notice the structural echoes of the shell:
- **`+=` / `-=` are "compound" — they mutate `*this` and return `Iter&`**, exactly like prefix `++`.
- **Binary `+` / `-` (iterator + n) do NOT mutate — they copy, delegate to `+=`/`-=`, and return the copy**, exactly like postfix `++`.
- There are **two `operator-`**: *iterator − n* → an iterator (move back `n`), and *iterator − iterator* → a `difference_type` (how far apart). Both are random-access-only.

### 13.3 One-glance summary

| Category | `++` | `--` | `+= -= + - [] < >` | "one step" mechanism | HW9 example |
|---|:---:|:---:|:---:|---|---|
| `forward_iterator` | ✅ | ❌ | ❌ | `p = p->next` | **`SetList`** |
| `bidirectional_iterator` | ✅ | ✅ | ❌ | `p = p->next` / `p = p->prev` | (real `set` / `map`) |
| `random_access_iterator` | ✅ | ✅ | ✅ | pointer arithmetic: `++p`, `p += n` | **`MapArray`** |

**The takeaway:** the pre/post **shell never changes**; postfix is *always* "snapshot + call prefix + return snapshot." Going up the hierarchy only (a) adds operators (`--`, then `+= -= + - [] < >`) and (b) swaps the one-line "step" mechanism (`next` → `next`/`prev` → pointer arithmetic).

> ⚠️ **Heads-up on the concrete HW9 code.** The skeleton above is the *canonical* STL form: prefix returns `Iter&`, the jump parameter is `difference_type`. Klefstad's HW9 code in Sections 14–15 follows the PPT style and returns prefix **by value** (`iterator operator++()`) and types the jump parameter as `int`. Both compile and work for HW9; the canonical form here is the better mental model and what real STL iterators use.

---

## 14. `SetList` Forward Iterator

> Corresponds to Topic 9 PPT slide 12

### 14.1 The class structure

```cpp
// nested inside template SetList<T>
struct iterator {
    using iterator_category = std::forward_iterator_tag;   // ← forward only, no --
    using value_type        = SetList::value_type;         // T
    using pointer           = value_type*;
    using reference         = value_type&;
    using difference_type   = std::ptrdiff_t;              // <cstddef>

    iterator(ListNode* node);

    iterator  operator++();                                // pre-increment
    bool      operator==(const iterator& other) const;
    bool      operator!=(const iterator& other) const;
    reference operator* () const;

private:
    ListNode* current;
};
```

### 14.2 Why `forward_iterator_tag`?

A singly-linked list can:

- read elements (`*iter`)
- advance forward (`++iter`)
- be compared (`==`, `!=`)
- be passed through multiple times (it's a multi-pass structure)

A singly-linked list **cannot**:

- go backwards (`--iter`) — there's no `prev` pointer
- jump (`iter + 5`) — would require walking 5 nodes, defeating O(1) iterator advance

The iterator category that exactly matches "read/write, multi-pass, forward only" is **`std::forward_iterator_tag`**.

> 💡 **Implication** — algorithms that *require* random access (`std::sort`, `std::nth_element`) won't compile when passed a `SetList::iterator`. Algorithms that need only forward (`std::find`, `std::for_each`, `std::copy`) work fine.

### 14.3 Member implementations

```cpp
iterator(ListNode* node) : current{ node } {}

iterator operator++() {
    if (current != nullptr) current = current->next;
    return *this;
}

bool operator==(const iterator& other) const { return current == other.current; }
bool operator!=(const iterator& other) const { return current != other.current; }

reference operator*() const { return current->data; }    // dereferencing end() is UB
```

> ⚠️ **`operator++` here is pre-increment.** Klefstad's PPT slide 12 only lists `operator++()`. If you also want post-increment (so users can write `it++`), you must add another overload:
> ```cpp
> iterator operator++(int) { auto tmp = *this; ++(*this); return tmp; }
> ```
> The `int` parameter is a dummy that distinguishes the two overloads; it's never used. The pre-increment version returns a reference (or its `*this`), the post-increment returns a copy of the old value. Pre-increment is also the form preferred in `for` loops.

### 14.4 Why `std::ptrdiff_t` for `difference_type`?

`std::ptrdiff_t` (from `<cstddef>`) is the signed integer type wide enough to represent the distance between any two pointers in a valid array. For HW9 it's the conventional, safe choice. Algorithms that ask "how far apart are these iterators?" via `std::distance(it1, it2)` get back a `difference_type`.

For a forward iterator, `std::distance` is O(n) — it walks from `it1` to `it2`. For a random-access iterator (next section), it's O(1).

### 14.5 Putting it all together — a `for` loop over `SetList`

Given the iterator above and `SetList`'s `begin()` / `end()`, this loop works:

```cpp
SetList<int> s;
s.insert(5); s.insert(3); s.insert(7);

for (auto it = s.begin(); it != s.end(); ++it)
    std::cout << *it << ' ';

// or, since SetList has begin/end:
for (int x : s)
    std::cout << x << ' ';

// or, with an STL algorithm:
auto it = std::find(s.begin(), s.end(), 3);
if (it != s.end()) std::cout << "found\n";
```

> 💡 **The payoff** — once your container provides `begin()`/`end()` returning a properly-tagged iterator, **every STL algorithm that requires only that category will Just Work** on your container. This is the deep promise of the STL.

---

## 15. `MapArray` and Its Random-Access Iterator

> Corresponds to Topic 9 PPT slides 13–14

### 15.1 The big idea

`std::map<K,V>` is typically implemented as a balanced binary search tree (red-black). That has O(log n) insert/find/erase, but lots of pointer overhead per node.

`MapArray<K,V>` makes a different trade: store key/value pairs in a **sorted `std::vector`**. Then:

- **find**: O(log n) — binary search via `std::lower_bound`.
- **insert**: O(n) — need to shift elements to keep the array sorted.
- **iteration**: O(1) per step, **cache-friendly** (contiguous memory).
- **memory**: tighter (no per-node allocations, no tree pointers).

For small-to-medium n, this often beats a real `map`. (The C++ standard library calls this pattern "flat_map" and recently standardized it.)

### 15.2 Class structure (PPT slide 13)

```cpp
template <typename K, typename V>
struct MapArray {
    using value_type      = std::pair<K, V>;     // each element is a (key, value) pair
    using key_type        = K;
    using mapped_type     = V;
    using pointer         = value_type*;
    using reference       = value_type&;
    using const_reference = const reference;

    std::vector<value_type> A;                   // ← THE storage

    MapArray();
    ~MapArray();

    V& operator[](K& k);                         // map-style bracket: insert-if-absent

    iterator insert(value_type val);             // insert sorted; returns iterator
    iterator find  (K& val);                     // binary search; returns iterator or end()

    iterator begin();
    iterator end();
};
```

> 💡 **Why a `std::vector<value_type>` as storage instead of a raw array?** Because we get growth, move semantics, copy/destruct, and range support **for free**. Rule of Zero: no special members needed for `MapArray` (the default destructor destructs the vector, the default copy/move work memberwise).

> ⚠️ **Klefstad's API choice** — `operator[]` and `find` take `K&` (non-const reference). Conventionally these would be `const K&`. Match Klefstad's signature for HW9 to satisfy the autograder, but be aware that `const K&` is the standard library's choice.

### 15.3 Implementing `operator[]` — insert-if-absent

`std::map<K,V>::operator[]` has a peculiar (but very Pythonic) behavior: if the key is missing, it **inserts a default-constructed value** and returns a reference to it. So `m["new key"] = 42;` works.

```cpp
V& operator[](K& k) {
    auto it = find(k);
    if (it != end()) return it->second;     // existing key → return its value

    // Missing key → insert with a default-constructed V
    value_type p{ k, V{} };
    auto newIt = insert(p);
    return newIt->second;
}
```

### 15.4 Implementing `find` — binary search

```cpp
iterator find(K& val) {
    auto it = std::lower_bound(A.begin(), A.end(), val,
                               [](const value_type& p, const K& k) {
                                   return p.first < k;
                               });
    if (it != A.end() && it->first == val) return iterator(&*it);
    return end();
}
```

Two parts:

1. `std::lower_bound` does binary search in O(log n) and returns an iterator to **the first element whose key is not less than `val`** — i.e., either an exact match or the first element greater.
2. Check if the returned position actually holds `val` (`it->first == val`). If yes, return its iterator; if no, return `end()` (not found).

### 15.5 Implementing `insert` — keep sorted (PPT slide 15)

```cpp
iterator insert(value_type val) {
    // Find where val should go (binary search).
    auto pos = std::lower_bound(A.begin(), A.end(), val.first,
                                [](const value_type& p, const K& k) {
                                    return p.first < k;
                                });

    // If the key is already present, don't duplicate (set/map semantics).
    if (pos != A.end() && pos->first == val.first)
        return iterator(&*pos);

    // Insert before pos; vector::insert shifts the tail to make room.
    auto newPos = A.insert(pos, val);
    return iterator(&*newPos);
}
```

The two utilities this depends on are the focus of Section 16: `std::lower_bound` and `vector::insert`.

### 15.6 The `MapArray::iterator` — random access (PPT slide 14)

```cpp
struct iterator {
    using iterator_category = std::random_access_iterator_tag;   // ← upgrade from forward
    using value_type        = MapArray::value_type;              // pair<K, V>
    using pointer           = value_type*;
    using reference         = value_type&;
    using difference_type   = std::ptrdiff_t;

    iterator(pointer p);

    iterator operator++();
    iterator operator--();
    iterator operator+(int n);
    iterator operator-(int n);
    iterator operator[](difference_type d);

    bool      operator==(const iterator& other) const;
    bool      operator!=(const iterator& other) const;
    reference operator*();
    pointer   operator->();
    reference operator[](difference_type const d) const;

private:
    pointer current;
};
```

### 15.7 Why `random_access_iterator_tag`?

Because the underlying storage is a `std::vector`, which is contiguous memory:

- `++` / `--` are pointer increment/decrement (O(1)).
- `+n` / `-n` are pointer arithmetic (O(1)).
- `it[5]` is `*(it + 5)` (O(1)).

All these properties qualify as **random access**. (Strictly, since the storage is contiguous, this could be `contiguous_iterator_tag` from C++17, but Klefstad's PPT uses the older `random_access_iterator_tag`, which is fine.)

> 💡 **Implication** — algorithms that need random access (`std::sort`, `std::nth_element`, binary search) work on `MapArray::iterator`. Compare with `SetList::iterator` (forward only), where they don't.

### 15.8 Implementing the operators

Because `current` is a `pointer` (a `value_type*`), most operators are just thin wrappers around pointer arithmetic:

```cpp
iterator(pointer p) : current{ p } {}

iterator operator++()                        { ++current; return *this; }
iterator operator--()                        { --current; return *this; }
iterator operator+(int n)                    { return iterator{ current + n }; }
iterator operator-(int n)                    { return iterator{ current - n }; }

bool operator==(const iterator& o) const     { return current == o.current; }
bool operator!=(const iterator& o) const     { return current != o.current; }

reference operator*()                        { return *current; }
pointer   operator->()                       { return  current; }

reference operator[](difference_type d) const { return current[d]; }
```

> ⚠️ **`operator->` is special.** Unlike `*`, which returns the element, `->` returns a pointer that the compiler then dereferences again. The user writes `it->first`; the compiler rewrites it as `(it.operator->())->first` which is `current->first`. This is what lets you write `it->first` and `it->second` to access map pair members.

### 15.9 Iterator validity and `vector::insert` invalidation

> ⚠️ **Critical reminder** — `vector::insert` may **reallocate** the underlying buffer (when capacity is exceeded). **All existing iterators (and pointers) into the vector are then invalid.** Section 5.10's invalidation table applies.

For `MapArray::insert`, this matters: if you store an iterator to "where we will insert," the iterator you saved becomes stale once the insert completes. The standard pattern is to use the iterator **returned** by `A.insert(pos, val)`, which points at the newly-inserted element in the (possibly reallocated) buffer.

### 15.10 Putting `MapArray` together

```cpp
MapArray<std::string, int> m;
m["apple"]  = 1;
m["banana"] = 2;
m["cherry"] = 3;

for (auto& [key, value] : m)        // structured binding (C++17)
    std::cout << key << "=" << value << '\n';

// Output:
//   apple=1
//   banana=2
//   cherry=3        ← sorted by key, courtesy of lower_bound + insert
```

---

## 16. Utilities for Keeping a Vector Sorted (`lower_bound` + `vector::insert`)

> Corresponds to Topic 9 PPT slide 15. Both utilities live in standard headers and are pre-tested — `MapArray` builds on them rather than re-implementing.

### 16.1 `std::lower_bound` — binary search for insertion point

```cpp
auto it = std::lower_bound(first, last, value);
```

- **Precondition**: the range `[first, last)` is sorted (with respect to `<`).
- **Returns**: an iterator to the first element **not less than** `value` (i.e., the first element ≥ `value`).
- **If `value` is greater than every element**: returns `last`.
- **Complexity**: O(log n) **comparisons**, but iterator advance is whatever the iterator's category supports (O(log n) total for random access, O(n) for forward iterators because *advancing* itself is O(n) on a linked list).

Three things `lower_bound` tells you:

| Result | Meaning |
|---|---|
| `it != last && *it == value` | exact match found, at position `it` |
| `it != last && *it != value` | not present, but if you inserted, it would go before `it` |
| `it == last` | not present, and would go at the end |

> 💡 **For map-style storage**, you supply a custom comparator that compares only the key part:
> ```cpp
> std::lower_bound(A.begin(), A.end(), key,
>     [](const auto& pair, const auto& k) { return pair.first < k; });
> ```
> The first argument is an element of the range, the second is the search value — note the asymmetry.

### 16.2 `std::vector::insert(pos, value)`

```cpp
vector<int> v = {1, 3, 5, 7};
auto it = std::lower_bound(v.begin(), v.end(), 4);
v.insert(it, 4);
// v is now {1, 3, 4, 5, 7} — still sorted
```

- **Inserts `value` before the position `pos`**.
- **Shifts all elements at and after `pos` one position to the right** to make room. O(n) (where n is the distance to the end).
- **May reallocate the vector**'s buffer if size > capacity. Reallocation invalidates **all** iterators and pointers into the vector.
- **Returns** an iterator pointing at the newly-inserted element (valid even after reallocation, because it's looked up from the new storage).

> ⚠️ **Iterator invalidation lookup table** (cppreference, see §5.10)

| Operation | Invalidates |
|---|---|
| `insert` (no reallocation) | iterators at or after the insertion point |
| `insert` (reallocation) | **all** iterators (and pointers, references) |
| `push_back` (no realloc) | only `end()` |
| `push_back` (realloc) | all |
| `erase` | the erased element and all after it (including `end()`) |

So after `auto newIt = v.insert(pos, value);`, any previously held iterator (including the `pos` you computed earlier) is stale. **Use `newIt`**.

### 16.3 The `lower_bound` + `insert` idiom — sorted insertion in 2 lines

This is the entire engine of `MapArray::insert`:

```cpp
auto pos    = std::lower_bound(v.begin(), v.end(), value);
auto newPos = v.insert(pos, value);
// v is now still sorted; newPos points at value
```

For a unique-keys container, add a presence check:

```cpp
auto pos = std::lower_bound(v.begin(), v.end(), value);
if (pos != v.end() && *pos == value)
    return pos;                          // already present, don't insert
return v.insert(pos, value);             // not present, insert here
```

### 16.4 Performance summary for `MapArray`

| Operation | Time | Reason |
|---|---|---|
| `find` | O(log n) | binary search |
| `insert` | O(n) | binary search + O(n) shift |
| `erase` | O(n) | binary search + O(n) shift |
| `operator[]` (existing key) | O(log n) | just find |
| `operator[]` (new key) | O(n) | find + insert |
| Iteration | O(n) total, O(1) per step | walk contiguous memory |
| Range-for | O(n) | walk contiguous memory |

For small n (say, up to a few thousand), `MapArray` typically *beats* `std::map` on real workloads because of cache effects. The crossover is workload-dependent.

---
## 17. Week 9 Comprehensive Cheat Sheet

### 17.1 Container Class Skeleton

Every user-defined container — `IntArray`, `SetList<T>`, `MapArray<K,V>` — has the same shape. Memorize this skeleton; the homework grader expects all of it.

```cpp
template <typename T>
class MyContainer {
public:
    // ---- type aliases (so generic code can introspect us) ----
    using value_type      = T;
    using pointer         = value_type*;
    using reference       = value_type&;
    using const_reference = const value_type&;
    using size_type       = std::size_t;

    // ---- special member functions (Rule of Three / Five / Zero) ----
    MyContainer();                                          // default ctor
    MyContainer(std::initializer_list<T> list);             // brace-init ctor
    MyContainer(const MyContainer& other);                  // copy ctor
    MyContainer& operator=(const MyContainer& other);       // copy assign
    MyContainer(MyContainer&& other) noexcept;              // move ctor
    MyContainer& operator=(MyContainer&& other) noexcept;   // move assign
    ~MyContainer();                                         // destructor

    // ---- minimum container interface ----
    size_type size() const;
    bool      empty() const;
    iterator  begin();
    iterator  end();
    iterator  insert(/* ... */);
    iterator  find(/* ... */);
    iterator  erase(iterator pos);

    // ---- nested iterator type (see Section 17.4) ----
    struct iterator { /* ... */ };

private:
    // storage
};
```

> 💡 **Rule of Zero shortcut**: If every data member is itself an STL container or a smart pointer, you can `= default` (or just omit) all six special members. The members do the right thing automatically. You only write copy/move/destructor by hand when you hold a **raw** owning pointer.

### 17.2 `std::initializer_list` Quick Reference

```cpp
#include <initializer_list>

class Foo {
public:
    Foo(std::initializer_list<int> list);    // enables Foo x{1, 2, 3};
};
```

**Selection rule when you write `Foo x{...}`:**

1. If a constructor taking `std::initializer_list<...>` exists and the braces match, **it wins** (even over more-specific ctors).
2. Otherwise fall back to a matching non-list constructor.
3. `Foo x(...)` with parentheses **never** considers the list ctor.

**Two traps:**

| Trap | Symptom | Fix |
|---|---|---|
| Adding a list ctor to an existing class | `Foo x{5};` suddenly creates a 1-element list instead of a size-5 container | Use `Foo x(5);` for the size-based call; document the breaking change |
| Storing a pointer from the list | `it->begin()` dangles after the temporary `initializer_list` dies | **Copy** the contents into your own storage in the ctor body |

### 17.3 `assert` vs `static_assert`

| | `assert(cond)` | `static_assert(cond, "msg")` |
|---|---|---|
| Header | `<cassert>` | none (built-in keyword) |
| When checked | **runtime**, every call | **compile time**, once |
| When disabled | `#define NDEBUG` before include (Release builds) | never — always checked |
| Failure | aborts program, prints expression + file + line | the program won't compile |
| Use for | programmer errors that should be impossible | facts about types and constants |
| Cost in Release | **zero** (compiled out) | **zero** (no codegen) |

**Idioms to memorize:**

```cpp
assert(p != nullptr && "list head is null in pop()");  // descriptive assert
static_assert(sizeof(int) >= 4, "32-bit int required");
static_assert(std::is_integral_v<T>, "T must be an integral type");
```

> ⚠️ **Never use assert for runtime conditions that can legitimately fail** — bad user input, file-not-found, network errors, etc. Those need real error handling (exceptions or error codes). Asserts are for catching *bugs*, not for handling *expected* failures.

### 17.4 Iterator Categories Quick Reference

| Category | Tag (`std::xxx_iterator_tag`) | Operations | Example container |
|---|---|---|---|
| input | `input_iterator_tag` | `*it` (read once), `++it`, `==`, `!=` | `istream_iterator` |
| output | `output_iterator_tag` | `*it = x` (write once), `++it` | `ostream_iterator`, `back_inserter` |
| forward | `forward_iterator_tag` | input + multi-pass | `forward_list`, **HW9 `SetList`** |
| bidirectional | `bidirectional_iterator_tag` | forward + `--it` | `list`, `set`, `map` |
| random-access | `random_access_iterator_tag` | bidirectional + `+`, `-`, `[]`, `<`, `>` | `deque`, **HW9 `MapArray`** |
| contiguous (C++17) | `contiguous_iterator_tag` | random-access + memory-adjacent | `array`, `vector`, `string` |

Hierarchy (right side strictly supports everything to the left):

```
input ──→ forward ──→ bidirectional ──→ random-access ──→ contiguous
output (separate hierarchy)
```

### 17.4b STL-Provided Iterator Types (Adapters and Special Iterators)

Section 17.4 lists **categories** — the abstract spec for "what operations must an iterator support, minimum." This section lists the concrete iterator types **the standard library actually ships**, and which category each one falls into.

**Container-native iterators** (every container ships a pair)

| Type | Header | Category | Notes |
|---|---|---|---|
| `C::iterator` | container header (`<vector>`, etc.) | depends on container | read/write; returned by `begin()` / `end()` |
| `C::const_iterator` | same | same | read-only; returned by `cbegin()` / `cend()` |
| `C::reverse_iterator` | same | bidirectional or higher | traverses backwards; returned by `rbegin()` / `rend()` |
| `C::const_reverse_iterator` | same | same | reverse + read-only; returned by `crbegin()` / `crend()` |

Specific category per standard container's `iterator`:

| Container | `iterator` category |
|---|---|
| `std::array`, `std::vector`, `std::string` | **contiguous** (C++17; random-access pre-C++17) |
| `std::deque` | random-access |
| `std::list` | bidirectional |
| `std::set`, `std::map`, `std::multiset`, `std::multimap` | bidirectional |
| `std::forward_list` | **forward** |
| `std::unordered_set` / `unordered_map` family | forward |
| **HW9 `SetList<T>`** | forward |
| **HW9 `MapArray<K,V>`** | random-access (backed by `vector`) |

> 💡 On a const container, `begin()` *already* returns `const_iterator`. `cbegin()` exists so you can also **force** a read-only iterator out of a non-const container (e.g. when using `auto` but you don't want modification to be allowed).

**Reverse iterator adapter** — `<iterator>`

| Type | Category | Use |
|---|---|---|
| `std::reverse_iterator<It>` | same as the wrapped `It` (must be at least bidirectional) | wraps a bidirectional iterator so `++` walks backwards. This is what `rbegin()` returns internally |
| `std::make_reverse_iterator(it)` (C++14) | same | factory function — build a reverse iterator from an ordinary one |

```cpp
std::vector<int> v{1, 2, 3, 4, 5};
for (auto it = v.rbegin(); it != v.rend(); ++it)
    std::cout << *it << ' ';   // 5 4 3 2 1
```

**Insert iterator adapters** — `<iterator>`, all are `output_iterator_tag`

| Type | Factory function | Behavior | Container requirement |
|---|---|---|---|
| `std::back_insert_iterator<C>` | `std::back_inserter(c)` | `*it = x` calls `c.push_back(x)` | needs `push_back` — `vector`, `deque`, `list`, `string` |
| `std::front_insert_iterator<C>` | `std::front_inserter(c)` | `*it = x` calls `c.push_front(x)` | needs `push_front` — `deque`, `list`, `forward_list` |
| `std::insert_iterator<C>` | `std::inserter(c, pos)` | `*it = x` calls `c.insert(pos, x)`, then `pos` auto-advances | any container with `insert(pos, val)` — `set`, `map`, `vector`, ... |

```cpp
std::vector<int> src{1, 2, 3};
std::vector<int> dst;
std::copy(src.begin(), src.end(), std::back_inserter(dst));   // dst: {1,2,3}

std::set<int> s;
std::copy(src.begin(), src.end(), std::inserter(s, s.end())); // s:   {1,2,3}
```

> ⚠️ Without `back_inserter`, `std::copy(..., dst.begin())` **overwrites** the existing elements of `dst` instead of appending — output iterators don't grow the container on their own. One of the most common newbie STL traps.

**Stream iterators** — `<iterator>`

| Type | Category | Meaning |
|---|---|---|
| `std::istream_iterator<T>` | input | wraps `cin >> T` as an input iterator; `++` reads the next value; **the default-constructed instance is the "end" sentinel** |
| `std::ostream_iterator<T>` | output | `*it = x` calls `out << x`, with an optional trailing separator |
| `std::istreambuf_iterator<char>` | input | character-level — the canonical way to slurp an entire file into a `string` |
| `std::ostreambuf_iterator<char>` | output | character-level output |

Classic one-liner STL idioms:

```cpp
// Read all ints from cin, write each to cout separated by spaces
std::copy(std::istream_iterator<int>(std::cin),
          std::istream_iterator<int>(),                  // default-constructed = end
          std::ostream_iterator<int>(std::cout, " "));

// Whole file → string
std::string contents{std::istreambuf_iterator<char>(file),
                     std::istreambuf_iterator<char>()};
```

**Move iterator** (C++11) — `<iterator>`

| Type | Category | Use |
|---|---|---|
| `std::move_iterator<It>` | same as `It` | `*it` returns an **rvalue reference** (`T&&`) instead of a normal `T&` — so algorithms *move* instead of *copy* |
| `std::make_move_iterator(it)` | same | factory |

```cpp
std::vector<std::string> src{"a", "b", "c"};
std::vector<std::string> dst(std::make_move_iterator(src.begin()),
                             std::make_move_iterator(src.end()));
// The strings in src have been moved out; src's elements are now in a
// valid-but-unspecified state.
```

**C++20 adapters** (just be aware — HW9 doesn't need these)

| Type | Use |
|---|---|
| `std::counted_iterator<It>` | wraps an iterator so it "remembers how many steps are left" — used with ranges |
| `std::common_iterator<It, S>` | adapts a ranges-style `(iterator, sentinel)` pair into an "old-style" `(iter, iter)` pair, so it can be fed into C++17 algorithms |

**Bottom line for HW9:** you only **write** one kind of iterator yourself — `SetList::iterator` (forward) and `MapArray::iterator` (random-access), both as **nested classes inside the container**, not adapters. But remember: the STL already ships the entire adapter set above for free — any algorithm from Week 8 (`copy`, `transform`, `accumulate`, ...) can drop into them. Combine with `back_inserter` / `ostream_iterator` / `make_reverse_iterator` and the algorithm writes wherever you need, no hand-rolled loop required.

> 💡 **Cross-week see also** — Week 8 §11.9 (set algorithms on sorted ranges) and §11.10 (heap algorithms) both apply directly to this week's HW9 containers: `MapArray` (sorted-vector backend) works with `set_union` / `set_intersection` / `set_difference`, and any random-access range works with `make_heap` / `pop_heap`. That's the payoff of "STL from the user's perspective" — once your iterator meets the category requirement, the full Week 8 algorithm catalog comes for free.

### 17.5 The Five `iterator_traits` Typedefs

Every iterator type **must** expose all five — either as nested `using`s in the iterator class, or via an `iterator_traits` specialization. Algorithms read these to pick the right strategy.

```cpp
struct iterator {
    using iterator_category = std::forward_iterator_tag;   // power level
    using value_type        = T;                           // what *it gives you
    using pointer           = T*;                          // what it->m gives you
    using reference         = T&;                          // type of *it
    using difference_type   = std::ptrdiff_t;              // type of it1 - it2
    // ...
};
```

**Why five?** Algorithms branch on `iterator_category` (e.g. `std::distance` is O(1) for random-access but O(n) for forward); they declare temporaries of `value_type`; they return `reference` from `*`; they use `difference_type` for distances; and they may use `pointer` for `it->m`. Miss one, and generic algorithms fail to compile against your iterator.

**Pointer specialization (cppreference):** `std::iterator_traits<T*>` is specialized so that `T*` itself counts as a contiguous iterator. That is why algorithms work on plain C-arrays.

### 17.6 Smart Pointer Decision Table

| Question | Answer |
|---|---|
| Need single owner, can transfer ownership? | **`std::unique_ptr<T>`** |
| Need multiple owners sharing one object? | **`std::shared_ptr<T>`** |
| Need to break a shared-ptr cycle (parent ↔ child)? | **`std::weak_ptr<T>`** (not in this week's reading) |
| Want a non-owning observer? | a **raw pointer** is fine — say it in a comment |
| Need to hold an array? | `std::unique_ptr<T[]>` with `make_unique<T[]>(n)`; **never** use a `shared_ptr<T[]>` unless C++17+ and you really need it |
| Calling `new` directly? | **Don't.** Use `make_unique` / `make_shared` |

**Side-by-side:**

| | `unique_ptr<T>` | `shared_ptr<T>` |
|---|---|---|
| Owners | exactly 1 | 1 to many |
| Copyable | ❌ (copy ctor `= delete`) | ✅ (bumps refcount) |
| Movable | ✅ (transfers ownership) | ✅ |
| Heap overhead | none beyond `T` | control block (refcount + deleter) |
| Per-op cost | nearly free | atomic ref-count bump on copy/dtor |
| Deletes when | `unique_ptr` itself dies | last `shared_ptr` dies (refcount → 0) |
| Factory | `std::make_unique<T>(args...)` | `std::make_shared<T>(args...)` |
| Get raw pointer | `.get()` | `.get()` |
| Release ownership | `.release()` returns raw, **no delete** | only by destruction or `.reset()` |
| Replace what it owns | `.reset(new_ptr)` | `.reset(new_ptr)` |

**Why `make_*` over `new`:**

- **Exception safety**: `foo(unique_ptr<A>(new A), unique_ptr<B>(new B))` can leak if `B`'s `new` throws between the two `new`s and the two `unique_ptr` constructions. `foo(make_unique<A>(), make_unique<B>())` cannot.
- **Less typing / no repeated type name**: `make_shared<Widget>(args)` instead of `shared_ptr<Widget>(new Widget(args))`.
- **`make_shared` does one heap allocation** for the object + control block (vs two for the `new` form).

### 17.7 RAII Replaces the Rule of Three

| Old (Week 5 / Week 6, HW4–HW6) | New (Week 9, HW9 onward) |
|---|---|
| Class holds `char* buf;` | Class holds `std::unique_ptr<char[]> buf;` (or `std::vector<char>`) |
| Must write destructor | Compiler-generated `~Class() = default;` is correct |
| Must write copy ctor | `= delete` (unique_ptr) or `= default` (vector deep-copies) |
| Must write copy assign | same as above |
| Must write move ctor | `= default` works |
| Must write move assign | `= default` works |
| Manual `delete[] buf;` | Smart pointer's destructor handles it |
| Easy to leak on early return / exception | Impossible — destruction is automatic |

> 💡 **Rule of Zero**: If you can express your class entirely as a composition of types that already manage their own resources, you can write **zero** special member functions. This is the modern C++ ideal. **HW9's `MapArray` is naturally Rule of Zero** (it just holds a `std::vector<std::pair<K,V>>`); **HW9's `SetList` is *not*** Rule of Zero because it uses raw `ListNode*` (per slide 6 warning — iterators would break otherwise).

### 17.8 C++20 Ranges & Views in One Page

```cpp
#include <ranges>
#include <algorithm>

// 1. Algorithms accept whole ranges (no begin/end pair needed)
std::vector<int> v{3, 1, 4, 1, 5, 9, 2, 6};
std::ranges::sort(v);                       // was: std::sort(v.begin(), v.end())

// 2. Views are lazy, composable transformations
namespace views = std::views;
auto evens_doubled = v | views::filter([](int i){ return i % 2 == 0; })
                       | views::transform([](int i){ return 2 * i; });

for (int x : evens_doubled) std::cout << x << ' ';

// 3. The LC125 palindrome idiom
bool is_palindrome(std::string const& s) {
    auto v = s | views::filter([](char c){ return std::isalnum(c); })
               | views::transform([](char c){ return std::tolower(c); });
    return std::ranges::equal(v, v | views::reverse);
}
```

**Properties to remember:**

- **Views own nothing.** They hold a reference to the source range; the source must outlive the view.
- **Views are lazy.** Nothing happens until iteration. Pipelining `| filter | transform | reverse` does no work until the range-for actually consumes elements.
- **Algorithms live in `std::ranges::`.** Views live in `std::views::` (which is itself a namespace alias for `std::ranges::views`).

### 17.9 HW9 Performance Summary

| Operation | `SetList<T>` (linked) | `MapArray<K,V>` (sorted vec) | `std::set<T>` (RB-tree) | `std::map<K,V>` (RB-tree) |
|---|---|---|---|---|
| `find` | O(n) | O(log n) | O(log n) | O(log n) |
| `insert` | O(n) (find + splice in O(1)) | O(n) (find + shift) | O(log n) | O(log n) |
| `erase(it)` | O(1) | O(n) (shift) | O(log n) amortized | O(log n) amortized |
| `operator[]` | — | O(log n) if present, O(n) if new | — | O(log n) / O(n) on insert |
| Iteration | O(n), cache-unfriendly | O(n), cache-friendly | O(n), cache-unfriendly | O(n), cache-unfriendly |
| Iterator category | forward | random-access | bidirectional | bidirectional |
| Memory per element | element + 1 pointer | just the element | element + 3 pointers + color bit | same |

**Read it this way:** for *small* `n` (a few thousand or fewer), `MapArray` typically beats `std::map` despite the worse asymptotic insert cost, because contiguous memory is enormously faster than chasing pointers. The crossover depends on your workload; the lesson is that **Big-O is not the whole story** — the constants matter.

### 17.10 The HW9 Incremental Development Recipe (Klefstad)

This is the order Professor Klefstad specifies for tackling HW9. **Do not skip steps.**

```
1. Start with working mapset from HW8           (baseline known-good)
2. Code SetList<T> container and its forward iterator
3. Test SetList in isolation with simple gtests (catch bugs early)
4. In mapset.cpp: replace std::set with SetList
   └── let the compiler tell you what SetList is missing
5. Test mapset again until fully working
6. Restore std::set; replace std::map with MapArray<K,V>
7. Repeat the compile-driven debugging loop
8. Finally: use BOTH SetList and MapArray together
9. Run autograder's extra gtests for SetList and MapArray
```

> ⚠️ **The deadly anti-pattern**: replacing *both* `std::set` and `std::map` simultaneously, then trying to debug. You will not know which of your two containers caused which error message. Always swap **one at a time**.

### 17.11 The `lower_bound` + `vector::insert` Idiom (MapArray's secret weapon)

```cpp
// Keep v sorted while inserting `value`
auto pos = std::lower_bound(v.begin(), v.end(), value);  // O(log n) binary search
v.insert(pos, value);                                     // O(n) shift

// For a set (no duplicates), check first:
auto pos = std::lower_bound(v.begin(), v.end(), value);
if (pos != v.end() && *pos == value)
    return pos;                  // already there
return v.insert(pos, value);     // not there — insert
```

Both `lower_bound` (returns iterator to first element ≥ value) and `vector::insert(pos, value)` (inserts *before* `pos`) come from the standard library. Together they let `MapArray` maintain a sorted invariant with no hand-written tree code.

---

## 18. Top Five Takeaways for Week 9

1. **A container class is a contract, not just a data structure.** To play in the STL sandbox, your container must expose: type aliases (`value_type`, `pointer`, `reference`, …), a `begin()`/`end()` iterator pair, plus a sensible subset of `insert`/`find`/`erase`/`size`/`empty`. Get the *contract* right and `std::ranges::sort(myContainer)`, `for (auto& e : myContainer)`, and `std::distance(begin, end)` all just work — *for free*. Get it wrong and nothing works. **HW9's `SetList` and `MapArray` are graded on whether they fulfill this contract**, not on whether they're clever. The takeaway: when you design a class that holds many of something, first ask *"what does the STL expect of a container?"* — then write that, then add your specifics.

2. **`std::initializer_list` is how braces become a constructor argument.** `Foo x{1, 2, 3};` looks like syntactic sugar but is actually a real overload resolution decision: the compiler builds a temporary `initializer_list<int>` and calls a constructor that takes one. Two consequences burned into the language: (a) **the list constructor wins over almost everything else** when braces are used, so adding one to an existing class can silently change what `Foo x{5};` means (your size-5 container suddenly becomes a 1-element list); (b) the underlying array is a *temporary* — if your constructor stashes a pointer instead of copying the contents, you have a dangling pointer the moment the constructor returns. Always **copy the data into your own storage**, and always prefer `()` over `{}` when you specifically want the size-based constructor.

3. **Iterators + `iterator_traits` are what make STL extensible by you.** Every algorithm in `<algorithm>` is templated, and that template doesn't know the difference between a `vector<int>::iterator`, a `list<int>::iterator`, and *your* `SetList<T>::iterator` — as long as your iterator exposes the **five required traits** (`iterator_category`, `value_type`, `pointer`, `reference`, `difference_type`). Algorithms read those traits to decide *which version* of themselves to compile: `std::distance` is O(1) on a random-access iterator and O(n) on a forward iterator, and the dispatch happens at compile time with **zero runtime cost**. This is the secret of why STL feels so consistent: every algorithm takes iterators, every iterator advertises its capabilities, and tag dispatch picks the optimal strategy. Write the traits correctly in your `SetList`/`MapArray` iterators and `std::find`, `std::ranges::equal`, range-for, and structured bindings all work on day one.

4. **RAII via smart pointers replaces the Rule of Three.** Every line you wrote in HW3–HW6 to manually `delete[] buf;` in destructors, deep-copy in copy constructors, and zero out source pointers in move constructors **goes away** the moment `buf` is a `std::unique_ptr<char[]>` or a `std::vector<char>`. The compiler-generated copy/move/destructor are correct, leak-free, and exception-safe. The single rule: **use `std::make_unique<T>(args)` or `std::make_shared<T>(args)`, never raw `new`.** The one place where you still *can't* delegate to a smart pointer is HW9's `SetList`: per Klefstad's PPT slide 6 warning, a `unique_ptr<Node>` `next` field makes iterators impossible because raw iterators would alias the owned chain. **For HW9 `SetList`, use raw `ListNode*` and write the manual Rule of Three; for `MapArray`, use `std::vector` and embrace the Rule of Zero.** Knowing *which one to apply where* is the maturity bar this week.

5. **Build HW9 in the order Klefstad specifies — incrementally — or you will drown.** The temptation is to rewrite all of `mapset.cpp` at once, then debug the wall of compile errors. Don't. The recipe is: (a) keep your working HW8 `mapset` running, (b) write `SetList<T>` + its iterator + isolated gtests until green, (c) substitute `SetList` for `std::set` in `mapset.cpp` and let the compiler tell you what's missing, (d) test the integrated `mapset` until fully working, (e) **revert**, then repeat the same loop for `MapArray<K,V>` replacing `std::map`, (f) finally enable both. **Always swap one container at a time.** This isn't just a style preference — it's how you keep your error messages diagnostic instead of catastrophic, and it's how you discover that you forgot to expose `value_type` *before* the autograder discovers it.

> ⚠️ **PPT-vs.-Reading priority reminder**: When Klefstad's PPT and LearnCpp disagree on terminology or implementation detail, **the PPT wins** (it's authoritative for this course). Where uncertain whether something belongs to Week 9 or Week 10 (e.g. the deeper ranges material on the cppreference link from Topic 9 slide 2), the material is **included** here — better to over-cover.

> 💡 **Looking ahead to Week 10** — Topic 9 PPT slides 12–15 (`SetList` / `MapArray` iterator details) and slide 9 (HW9 incremental dev) extend through Week 10's lab and homework cycle. The Week 10 reading is likely to introduce templates more deeply, the rest of `<algorithm>`, and possibly `std::function` and lambdas in more detail. The Topic 9 PPT does not yet expose what Week 11+ holds; based on the course outline you may see `ICS_45c_Week_12_C_Tour.pdf` (the C compatibility tour) and templates-in-depth before the final.
