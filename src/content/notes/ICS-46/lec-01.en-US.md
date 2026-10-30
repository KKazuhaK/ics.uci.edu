---
title: "Randomness, References & Pointers"
summary: "Random number generation in C++, references, raw pointers, and an introduction to smart pointers and ownership."
---

# Information and Computer Science 46 — Lecture 1: Randomness, References, Pointers

## Table of Contents

- [1. Randomness and Random Number Generation](#1-randomness-and-random-number-generation)
- [2. C++ References](#2-c-references)
- [3. C++ Pointers](#3-c-pointers)
- [4. Smart Pointers and Ownership](#4-smart-pointers-and-ownership)
- [5. In-class Activities (with Solutions)](#5-in-class-activities-with-solutions)
- [6. Quick Reference & Top 5 Things to Remember](#6-quick-reference--top-5-things-to-remember)

> UCI ICS 46: Data Structure Implementation and Analysis — Prof. Tom Yeh, Fall 2026, Tuesday 09/29/26
> Built from the Lecture 1 slides (pages 1–31, 35), with Thornton's ICS 46 notes (Randomness, Smart Pointers), Thornton's ICS 45C notes (Pointers and the Heap) and W. Brown's *Random Number Generation in C++11* (N3551, linked on the recap slide) as supplements. Organized by concept, not by source.

> 📅 **Class logistics**:
> **Lab 1** released, due **Mon 10/5**: set up the environment, compile a small test program, submit to **Gradescope** (used for all homeworks, labs and projects).
> **Programming environment**: VS Code + C++ on the **UCI ICS OpenLab JupyterHub** — grading is done in this environment; setup directions are in Lab 1. Turn off Copilot and any other AI assistance.
> **Pensive** link posted for problem sets. **Office hours** calendar updated: Prof. Yeh Tue/Thu 5–6 pm (ICS1 195); lectures Tue/Thu 3:30–4:50; discussion Fri.
> Why this course: interview questions have traditionally focused on data structures and algorithms.
> Today's goals: randomness, references, pointers, smart pointers.

---

## 1. Randomness and Random Number Generation

### 1.1 What "random" means

A sequence is **random** if nobody can predict the next value better than chance, even after seeing all previous ones; the goal is for programs to *generate* such sequences (slide 6). Uses: **machine learning** (weight init, train/test splits, SGD), **security** (keys, tokens — a predictable key is a guessable key), **simulation** (Monte Carlo, varying the seed), **games** (world generation, NPC decisions).

### 1.2 True random vs. pseudorandom

Slide 7 splits random number generators (RNGs) into two kinds:

| | Truly random (TRNG / hardware RNG) | Pseudorandom (PRNG) |
|---|---|---|
| How | measures changing **physical phenomena** | **computes** each value from the previous internal state |
| Examples | dice, coins, cards; network traffic, temperature, lava lamps; atmospheric noise (random.org) | Mersenne Twister, linear congruential generators |
| Reproducible? | no | **yes** — same seed, same sequence |
| Speed | limited (collecting entropy takes time) | very fast |

The title-slide photo is Cloudflare's lava-lamp "Wall of Entropy", a real TRNG source.

> 📘 **Beyond the lecture** (Thornton, Randomness): entropy is scarce — the OS can only observe so many unpredictable events per second. So real programs combine both: take **one** value from the entropy source as the **seed**, then let a fast PRNG expand it into a long sequence.

### 1.3 Seeding the engine

In `<random>` the PRNG is called an **engine**, and you create it with a **seed** (slide 8).

**Approach 01 — fixed seed**: identical sequence every run; best for testing, simulations, debugging.

```cpp
#include <random>
const unsigned int SEED = 123;
std::default_random_engine engine{SEED};
```

**Approach 02 — entropy source**: `std::random_device` taps the OS/hardware entropy; **call** it to get one seed. Different sequence each run; for production.

```cpp
#include <random>
std::random_device device;
std::default_random_engine engine{device()};   // note the ()
```

> ⚠️ **Pitfall**: a fixed seed reproduces the sequence only on the **same standard library** — `default_random_engine` is vendor-chosen, so g++ and MSVC may print different numbers for seed 123. Use `std::mt19937` if you need identical results everywhere.

### 1.4 Distributions: uniform and normal

The engine produces raw uniform bits; a **distribution** shapes them into the values you want (slide 9).

- **Uniform integer**: integers in [min, max], **both inclusive**, all equally likely (flat).
- **Normal / Gaussian**: bell curve centered at the **mean**; the **standard deviation** sets the spread (e.g. exam scores).

```cpp
// Equal chance for 1, 2, 3, 4, 5, or 6
std::uniform_int_distribution<int> distribution{1, 6};

double mean = 10.0;
double stddev = 3.0;
std::normal_distribution<double> d(mean, stddev);
```

Slide 9's two histograms (stars per value):

| value | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| uniform, min 0, max 10 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 |
| normal, mean 5.0, sd 2.0 | 0 | 1 | 3 | 6 | 9 | 9 | 8 | 5 | 3 | 1 | 0 |

(The normal histogram also lists −2, −1, 11, 12 — all empty.)

Uniform is flat; normal peaks around the mean and almost nothing lands more than 2 sd away (below 1 or above 9).

> ⚠️ **Pitfall** (N3551 §3): don't write `1 + engine() % 6`. The engine's range usually isn't a multiple of 6, so low values come out slightly more often — a biased die. Always go through a distribution (and avoid the old C `rand()`).

### 1.5 Putting it together: rolling dice

Slide 10: create the three pieces **once** — (1) entropy + engine, (2) distribution mapping to [1, 6], (3) call `distribution(engine)` for each sample.

```cpp
#include <random>
#include <iostream>

// 1. Source of Entropy & Engine
std::random_device device;
std::default_random_engine engine{device()};   // slide: engine{device}

// 2. Inclusive Uniform Distribution [1, 6]
std::uniform_int_distribution<int> distribution{1, 6};

// 3. Generate Samples
for (int i = 0; i < 1000; ++i) {
    std::cout << distribution(engine) << " ";
}
std::cout << std::endl;
```

**Slide bug (p10, p11)**: `engine{device}` → `engine{device()}`. Passing the device object itself doesn't compile (g++: `no matching function for call to 'std::linear_congruential_engine<...>(<brace-enclosed initializer list>)'`); you must call it.

> ⚠️ **Pitfall** (Thornton): don't create the device/engine/distribution inside the loop — you'd hit the slow entropy source every time and throw away the PRNG state. Create once, call many times.

> 📝 **Practice**: [Activity 0](#51-activity-0-random-number-generation-slide-11) — seed with 46 and switch to `normal(4.0, 0.6)`.

---

## 2. C++ References

### 2.1 A reference is an alias

A **reference** is another name for an existing object (slide 13). It **must be initialized**, and it **can never be re-bound** to another object. Also called an **lvalue reference**; declared with `&` on the type: `int& ref = existingVariable;`. Unlike a Python name, `r = j;` does not rebind `r` — it copies `j`'s value into whatever `r` refers to.

```cpp
int i = 3;
int& r = i;                       // r now refers to i
std::cout << r << std::endl;      // writes 3
r = 4;                            // a change to r is also a change to i
std::cout << i << std::endl;      // writes 4
i = 5;                            // a change to i is also a change to r
std::cout << r << std::endl;      // writes 5
```

There is one `int` with two names.

### 2.2 Pass-by-value vs. pass-by-reference

Pass-by-value gives the function a **copy**; pass-by-reference makes the parameter an **alias** for the caller's argument (slide 14). Why use references: it **allows modification** of the original, and **avoids copying** large data (performance, memory).

```cpp
void foo(int& x)
{
    x++;
    std::cout << x << std::endl;   // prints 4
}

int main()
{
    int i = 3;
    foo(i);
    std::cout << i << std::endl;   // prints 4
    return 0;
}

void swap(int& a, int& b)
{
    int temp = a;
    a = b;
    b = temp;
}
```

With `void foo(int x)` the output would be `4` then `3`; `swap` without `&` would swap two copies and change nothing.

> 💡 **Key Insight**: read a big object → `const T&`; modify the caller's object → `T&`; small types like `int` → by value.

### 2.3 Return-by-value vs. return-by-reference

Slide 15: **return by value by default** — it's safe (no dangling references), cheap thanks to RVO / move semantics / copy elision (guaranteed in C++17), and simpler. **Return by reference** for class getters (`const T&` to big internal data), operator overloading (`operator[]`, `operator=`, `operator<<` so calls can chain), and long-lived objects outside the function.

**Critical rule: never return a reference to a local stack variable** — it's destroyed when the function returns.

```cpp
// BAD: Dangling reference to local object
int& getBad() { int local = 42; return local; } // DANGER! Destroyed on exit

// GOOD: Return by value (optimized by RVO/Copy Elision)
int getGood() { int val = 42; return val; } // Safe zero-copy return
```

What `getBad()` actually does (g++ 13, `-Wall -fsanitize=address,undefined`):

```text
bad.cpp:2:40: warning: reference to local variable 'local' returned [-Wreturn-local-addr]
bad.cpp:2:40: runtime error: reference binding to null pointer of type 'int'
AddressSanitizer: SEGV on unknown address 0x000000000000
```

> 📘 **Beyond the lecture** (Thornton, Move Semantics): *moving* a `std::vector` just steals its internal array pointer, size and capacity (O(1)) instead of copying every element (O(n)). That's why slide 15 can call return-by-value cheap. `std::move(x)` only marks `x` as "safe to steal from" — you'll see it with `unique_ptr` in §4.4.

---

## 3. C++ Pointers

### 3.1 What a pointer is

A **pointer** holds a **memory address** (a run-time value) plus the **type** it points to (known at compile time) (slide 17). Declared with `*`: `int* x;`. Read declarations right to left: `int** q` is "pointer to pointer to int", `int*& s` is "reference to pointer to int".

| | Reference `int&` | Pointer `int*` |
|---|---|---|
| Can be null? | no | yes (`nullptr`) |
| Must be initialized? | yes | no (but uninitialized = garbage) |
| Can change target? | no | yes |
| Reach the object | just the name | `*p` |

### 3.2 `&`, `*`, and pointer assignment

The **address-of** operator `&` (in an *expression*) gives a variable's address — different from `&` in a *type*, which declares a reference. The **dereference** operator `*` is its opposite: it reaches the object at the address (and the name has nothing to do with references; it's an older C term). You can copy pointers (`int* q = p;` → both point at the same object) and have pointers to pointers (`int** q = &p;`) (slides 17–18).

```cpp
int i = 3;
int* p = &i;
std::cout << i << std::endl;   // 3
*p = 4;                        // change i through p
std::cout << i << std::endl;   // 4
int** q = &p;                  // *q is p, **q is i (prints 4)
```

Slide 19: pointers enable direct memory manipulation, dynamic allocation, and data structures (linked lists, trees, graphs). Unlike a reference, a pointer can be **re-pointed**:

```cpp
int x = 10;
int* p = &x;    // p holds the memory address of x
*p = 20;        // changes x to 20 through the pointer
int y = 30;
p = &y;         // now p points to y instead of x
```

Verified: afterwards `x` is 20 and `*p` is 30.

> ⚠️ **Pitfall**: an address isn't an `int` — `int* p = i;` is a compile error; write `int* p = &i;`.

### 3.3 `nullptr`

`nullptr` means "points to nothing" (e.g. the last node's `next` in a linked list). Slide 19 asks what happens if you dereference it: **undefined behavior** — in practice a crash.

```cpp
int* p = nullptr;
*p = 3;              // CRASH
```

```text
Segmentation fault            # plain g++, exit code 139
```

Check `if (p != nullptr)` before dereferencing a pointer that might be null.

### 3.4 Stack vs. heap; pointers and references together

Two memory regions (slide 20): the **stack** holds function calls and locals (static allocation, freed automatically); the **heap** holds objects created by `new` at run time (dynamic allocation, alive until `delete`). **References are implicit synonyms for objects; pointers store the location of objects.**

```cpp
int* p = new int;     // new int: allocate an int on the heap
*p = 3;

int& q = *p;          // q is another name for the heap int
q = 4;

std::cout << *p << std::endl;   // 4

int* r = &q;          // address of the int q names (same as p)
*r = 5;

std::cout << *p << std::endl;   // 5

int*& s = p;          // s is a reference to an int pointer
*s = 6;

std::cout << *p << std::endl;   // 6
```

Slide 20's program in memory — one heap `int`, four ways to reach it (dotted arrows are references). Step through it below (← / → keys work when the demo is focused):

```viz memory-trace
{"title": "Slide 20: p, q, r, s", "steps": [{"code": "int* p = new int; *p = 3; int& q = *p; q = 4;", "note": "p points at a heap int; q is another name for it (dashed = reference), so q = 4 writes the int", "stack": [{"frame": "main", "vars": [{"name": "p", "value": "->h1"}, {"name": "q", "value": "->h1", "ref": true}]}], "heap": [{"id": "h1", "type": "int", "fields": [{"name": "value", "value": "4", "old": "3"}]}]}, {"code": "int* r = &q; *r = 5; int*& s = p; *s = 6;", "note": "r holds the same address as p; s is a reference to the pointer p itself", "add_vars": {"main": [{"name": "r", "value": "->h1"}, {"name": "s", "value": "->main.p", "ref": true}]}, "set": {"h1.value": {"value": "6", "old": "4"}}}]}
```

One heap `int`, four ways to reach it: verified `r == p` and `&s == &p` both print `true`.

> 📝 **Practice**: [Activity 1a](#52-activity-1a-visualize-pointers-and-references-slide-21) and [Activity 1b](#53-activity-1b-pointers--references-slide-22) — same picture, then one changed line.

### 3.5 `new`, `delete`, leaks and dangling pointers

`delete p` deletes **the object p points to**, not `p` itself. Rule: **every `new` has exactly one matching `delete`**. Breaking it:

| Bug | What happens |
|---|---|
| **Memory leak** | never deleted; once the last pointer to it is gone, it's unreachable but still allocated |
| **Dangling pointer** | after `delete p`, `p` still holds the old address; using it is undefined behavior |
| **Double free** | deleting the same address twice — undefined behavior (Activity 1b) |

> 📘 **Beyond the lecture** (Thornton 45C): every time you write `new`, ask "who will delete this, and when?" Python frees heap objects with a garbage collector; C++ has none, so that's your job — or a smart pointer's.

---

## 4. Smart Pointers and Ownership

### 4.1 The problem with raw pointers

Slide 24's dangers: dereferencing `nullptr` is UB; a bad cast can point anywhere; the **same syntax** points to one object or an array (`new int` vs `new int[10]`); and a pointer **still points to deallocated objects** (dangling). So: **prefer stack allocation** (cleaned up automatically on scope exit, even with exceptions) and **allocate dynamically only when necessary** — size unknown until run time, or the data must outlive the function.

Smart pointers (in `<memory>`) are the modern solution:

| Smart pointer | Ownership |
|---|---|
| `std::unique_ptr` | exclusive |
| `std::shared_ptr` | shared (reference counting) |
| `std::weak_ptr` | non-owning observer |

**Slide bug (p24)**: `std::share_ptr` → `std::shared_ptr`.

### 4.2 Ownership

A pointer that **owns** an object must make sure it's freed when the pointer is destroyed (slide 25). Thinking in ownership prevents leaks (nobody deletes) and double deletes (two pointers delete).

```cpp
class A
{
public:
    A();
    ~A();

private:
    B* b;
    // other member variables would be here
};

A::A()
    : b{new B}, ... // other member variable initializers would be here
{
    // other code to be run after the initializers would be here
}

A::~A()
{
    // necessary cleanup other than deleting the object pointed to by b
    // would be here

    delete b;
}
```

**Slide 25's question — what if the constructor throws after `new B`?** `A` never finished constructing, so `~A()` never runs. The member `b` is destroyed, but destroying a *raw* pointer doesn't delete the `B` → **leak**. (Verified side by side in §4.3.)

### 4.3 `std::unique_ptr`: exclusive ownership

A `unique_ptr` **destroys the object it points to when it is itself destroyed** — guaranteed automatic deletion (slide 26). Pointed-to type goes in `< >`.

```cpp
#include <memory>    // We need this if we want to use smart pointers

void foo()
{
    // Creates a unique_ptr called p and points it to a newly-allocated int.
    // p holds unique ownership of that int.
    std::unique_ptr<int> p{new int};

    // We can dereference the pointer with the * operator, just as you'd
    // expect with a raw pointer.
    *p = 3;
    std::cout << *p << std::endl;

    // When p falls out of scope -- either because the function ends normally
    // or because the function threw an exception -- it will destroy the
    // int it points to automatically, so no need for delete!  Similarly, if
    // we re-point p to a new integer later, or we point it to null, a
    // deletion will also be triggered.
}
```

Slide 27 rewrites class A with `std::unique_ptr<B> b;` — `~A()` no longer needs `delete b` (and can be omitted entirely if it has nothing else to do). **Slide bug (p27)**: the class is followed by a duplicated `};` → one `};`.

Example — both versions with a constructor that throws (verified):

```cpp
struct B {
    B()  { std::cout << "B constructed" << std::endl; }
    ~B() { std::cout << "B destroyed" << std::endl; }
};
class RawA {                     // slide 25 version
public:
    RawA() : b{new B} { throw std::runtime_error("constructor failed"); }
    ~RawA() { delete b; }
private:
    B* b;
};
class A {                        // slide 27 version
public:
    A() : b{new B} { throw std::runtime_error("constructor failed"); }
private:
    std::unique_ptr<B> b;
};
```

```text
B constructed
RawA: constructor failed          <- no "B destroyed": leaked
B constructed
B destroyed
A: constructor failed
==ERROR: LeakSanitizer: detected memory leaks   (1 byte: RawA's B)
```

> 📘 **Beyond the lecture** (Thornton, Smart Pointers): this is **RAII** — acquire in a constructor, release in a destructor; local objects' destructors always run, on normal return *and* during an exception. Modern code usually writes `auto p = std::make_unique<int>(3);` (and `std::make_shared`) instead of a bare `new`.

### 4.4 `unique_ptr` cannot be copied

**It's unsafe to copy a `unique_ptr`, so it's not allowed** (slide 28). Slide 28 asks what happens with pass-by-value:

```cpp
void foo(std::unique_ptr<int> q)
{
    *q = 4;
}

void bar()
{
    std::unique_ptr<int> p{new int};
    *p = 3;
    foo(p);
    std::cout << *p << std::endl;
}
```

**Answer: it doesn't compile** — `error: use of deleted function 'std::unique_ptr<...>::unique_ptr(const std::unique_ptr<...>&)'`. If it were allowed, `p` and `q` would both "own" the int (the slide's picture); when `foo` returns, `q` deletes it, and `p` dangles and would delete it again.

What to write instead (verified):

```cpp
void borrow(int& x) { x = 4; }                        // just use the int
void borrowOwner(std::unique_ptr<int>& q) { *q = 5; } // use the caller's owner
void take(std::unique_ptr<int> q) { /* ... */ }       // take ownership

borrow(*p);          // p still owns the int
borrowOwner(p);      // p still owns the int
take(std::move(p));  // ownership moves into q; afterwards p == nullptr
```

### 4.5 `std::shared_ptr`: reference counting

With shared ownership (slide 29), the object lives **as long as at least one** `shared_ptr` points to it and is destroyed when the **last** one goes away. It works by **counting** pointers ("similar to Python garbage collection"), and `shared_ptr` **can be copied** safely — a copy adds 1.

```cpp
void foo()
{
    std::shared_ptr<int> p1{new int};     // p1 points to a new integer
    std::shared_ptr<int> p2 = p1;         // p2 points to the same integer
    *p1 = 4;                              // 4 is stored in that integer
    std::cout << *p2 << std::endl;        // prints 4
    p1 = nullptr;                         // p1 no longer points to the integer, but p2 still does
}                                         // when the function ends, the integer is destroyed
```

| After line | `use_count` |
|---|---|
| `p1{new int}` | 1 |
| `p2 = p1` | 2 |
| `p1 = nullptr` | 1 |
| `}` (p2 destroyed) | 0 → int deleted |

> ⚠️ **Pitfall**: "similar to Python" is only half true — Python also has a cycle collector; `shared_ptr` does **not**. See §4.6.

### 4.6 The cycle problem and `std::weak_ptr`

Slide 30 (Activity 2): even shared ownership can leak.

```cpp
#include <iostream>
#include <memory>

struct Child;  // Forward declaration

struct Parent {
    std::shared_ptr<Child> child;
    ~Parent() { std::cout << "Parent destroyed\n"; }
};

struct Child {
    std::shared_ptr<Parent> parent;
    ~Child() { std::cout << "Child destroyed\n"; }
};

int main() {
    std::shared_ptr<Parent> p(new Parent());
    std::shared_ptr<Child>  c(new Child());

    p->child = c;    // Parent owns Child
    c->parent = p;   // Child owns Parent

    // Neither Parent nor Child is destroyed here because
    // they keep each other alive (circular reference).
    return 0;
}
```

The cycle in memory. Step through it below (← / → keys work when the demo is focused):

```viz memory-trace
{"title": "Activity 2: a shared_ptr cycle", "steps": [{"code": "shared_ptr<Parent> p(new Parent()); shared_ptr<Child> c(new Child());", "stack": [{"frame": "main", "vars": [{"name": "p", "value": "->P"}, {"name": "c", "value": "->C"}]}], "heap": [{"id": "P", "type": "Parent", "fields": [{"name": "child", "value": "nullptr"}, {"name": "use_count", "value": "1"}]}, {"id": "C", "type": "Child", "fields": [{"name": "parent", "value": "nullptr"}, {"name": "use_count", "value": "1"}]}]}, {"code": "p->child = c;  c->parent = p;", "note": "each object now has two owners: a local and the other object", "set": {"P.child": {"value": "->C", "old": "nullptr"}, "C.parent": {"value": "->P", "old": "nullptr"}, "P.use_count": {"value": "2", "old": "1"}, "C.use_count": {"value": "2", "old": "1"}}}, {"code": "} // end of scope: p and c destroyed", "note": "counts drop to 1, not 0 — the two objects keep each other alive and nothing outside can reach them: leaked, no destructor runs", "pop_frame": true, "set": {"P.use_count": {"value": "1", "old": "2"}, "C.use_count": {"value": "1", "old": "2"}}}]}
```

Neither destructor message prints. (Verified counts: Parent 2, Child 2 after the assignments. Run inside a helper function, LeakSanitizer reports `80 byte(s) leaked in 4 allocation(s)` — two objects plus two control blocks.)

**Fix**: make the back-pointer non-owning. A `weak_ptr` points at a `shared_ptr`-managed object **without** adding to its count.

```cpp
struct Child {
    std::weak_ptr<Parent> parent;          // FIX: observer, not owner
    ~Child() { std::cout << "Child destroyed\n"; }
};
// to use it:  if (std::shared_ptr<Parent> pp = c->parent.lock()) { ... }
```

```text
Parent count 1, Child count 2
child can still reach its parent
Parent destroyed
Child destroyed
```

`p` dies → Parent's count hits 0 → Parent destroyed, which destroys its `child` member → Child's count hits 0.

> 📝 **Practice**: [Activity 2](#54-activity-2-shared-ownership-slide-30).

### 4.7 Guidelines: borrowing vs. owning

**Not all pointers imply ownership** — objects can be **borrowed** without taking responsibility for them (slide 31).

| Use | Meaning | When |
|---|---|---|
| `A&` / `const A&` | reference: **guaranteed existence** (no null); `const` forbids modification | the borrower always needs an object |
| `A*` | raw pointer: **explicit non-ownership** by convention; **optional presence** (may be `nullptr`) | the object may be absent |
| `std::weak_ptr<A>` | smart non-owning; pairs with `shared_ptr` | back-references in shared structures |

Practical example: tree nodes hold `shared_ptr` to their **children** and `weak_ptr` to their **parent** — the §4.6 fix.

> ➡️ **Continued in [Lecture 2](lec-02.en-US.md)**: Activity 3 (converting a tree's raw pointers to `unique_ptr`, then to `shared_ptr` + `weak_ptr`, then to `unique_ptr` + raw pointers), using raw and smart pointers together (`.get()`, owners vs. observers), and the smart pointer recap.

---

## 5. In-class Activities (with Solutions)

### 5.1 Activity 0: Random Number Generation (slide 11)

Update `random_test.cpp` (class Google folder) to (1) print random numbers from a **PRNG seeded with 46**, (2) using a **normal distribution** with mean **4.0** and stddev **0.6**. The given code uses `engine{device}` and `uniform_int_distribution<int> distribution{1, 6}`.

**Solution** — change the two lines (no `random_device` needed for a fixed seed):

```cpp
const unsigned int SEED = 46;
std::default_random_engine engine{SEED};                     // 1) fixed seed
std::normal_distribution<double> distribution{4.0, 0.6};    // 2) normal(4.0, 0.6)
```

First 10 values (g++ 13 / libstdc++), identical on every run:

```text
2.94246 4.7139 3.62995 3.87306 4.78358 4.23905 3.89193 3.93273 4.34897 4.33676
```

1000 samples have mean 4.007 and about 68% fall in 3.4–4.6 (within one sd). If you keep the device instead, fix `engine{device}` → `engine{device()}`.

### 5.2 Activity 1a: Visualize Pointers and References (slide 21)

Draw stack/heap (dashed = reference, solid = pointer) for:

```cpp
int* a = new int;
*a = 2;

int* b = new int;
*b = 3;

*a = *b;

int& c = *b;
c = 6;

std::cout << *a << std::endl;

int*& d = a;
*d = 9;

std::cout << *a << std::endl;

delete a; delete b;
```

**Solution** — prints **`3`** then **`9`**; clean under ASan.

- `*a = *b` copies the **value** 3; `a` and `b` still point at two different ints.
- `c` names `b`'s int, so `c = 6` leaves `a`'s int at 3 → prints 3.
- `d` is another name for the pointer `a`, so `*d = 9` writes `a`'s int → prints 9.
- Final picture: `a` → int 9, `b` → int 6, `c` dashed to the 6, `d` dashed to `a`. Two objects, each deleted once.

### 5.3 Activity 1b: Pointers & References (slide 22)

Same code, but `*a = *b;` becomes `a = b; // change from 1a`.

**Solution** — prints **`6`** then **`9`**, then crashes:

- `a = b` copies the **address**: both point at the int holding 3. The int holding 2 has no pointer left → **leak**.
- `c = 6` and `*d = 9` both write that one shared int → 6, then 9.
- `delete a; delete b;` deletes the same address twice → **double free**:

```text
6
9
==ERROR: AddressSanitizer: attempting double-free on 0x502000000030 in thread T0
```

`*a = *b` copies what's pointed to; `a = b` copies the pointer — the aliasing smart pointers exist to prevent.

### 5.4 Activity 2: Shared Ownership (slide 30)

For the `Parent`/`Child` program in [§4.6](#46-the-cycle-problem-and-stdweak_ptr): (a) what happens to the parent and child at the end of `main`? (b) why? (c) what's the fix?

**Solution.**
(a) Neither is destroyed — no destructor output; both objects leak.
(b) Each has two owners (a local + the other object). When `p` and `c` die, each count drops to 1, not 0: a **reference cycle**, which `shared_ptr` can't detect.
(c) Change `Child`'s member to `std::weak_ptr<Parent> parent;`. Parent's count stays 1, so both are destroyed (`Parent destroyed`, `Child destroyed`). Use `lock()` to reach the parent.

---

## 6. Quick Reference & Top 5 Things to Remember

| Want | Write |
|---|---|
| reproducible engine | `std::default_random_engine engine{46u};` |
| real-run engine | `std::random_device device; std::default_random_engine engine{device()};` |
| die roll / bell curve | `std::uniform_int_distribution<int> d{1, 6};` / `std::normal_distribution<double> d{4.0, 0.6};` then `d(engine)` |
| alias, never null, never re-bound | `T& r = x;` |
| address / follow address | `&x` / `*p` |
| one owner, auto delete | `std::unique_ptr<T>` — `std::move` to hand over |
| several owners | `std::shared_ptr<T>` — copy adds to the count |
| non-owning back-pointer | `std::weak_ptr<T>` — `lock()` to use |
| borrow: must exist / may be absent | `const T&` or `T&` / `T*` |

**Top 5 things to remember**

1. Seed once (`engine{device()}` with the parentheses, or a fixed seed for tests) and always go through a distribution.
2. A reference is a permanent alias: assigning through it never re-binds it, and never return a reference to a local.
3. `*a = *b` copies the value; `a = b` copies the address — which can leak the old object and set up a double free.
4. `unique_ptr` can't be copied (two owners would double-delete); borrow with `T&`/`T*` or transfer with `std::move`.
5. `shared_ptr` cycles leak because the counts never reach 0; make the child → parent pointer a `weak_ptr`.
