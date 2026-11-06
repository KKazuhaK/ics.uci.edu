# Information and Computer Science 45C — Week 7 Integrated Reading Notes

## Table of Contents

- [1. Weekly Learning Objectives](#1-weekly-learning-objectives)
- [2. The Motivation for Generic Programming](#2-the-motivation-for-generic-programming)
- [3. Function Templates: Syntax and Semantics](#3-function-templates-syntax-and-semantics)
- [4. Function Template Instantiation](#4-function-template-instantiation)
- [5. Template Classes (Class Templates)](#5-template-classes-class-templates)
- [6. Template Non-Type Parameters](#6-template-non-type-parameters)
- [7. Lambdas — Anonymous Functions](#7-lambdas--anonymous-functions)
- [8. Lambda Captures](#8-lambda-captures)
- [9. The Need for Exceptions](#9-the-need-for-exceptions)
- [10. Basic Exception Handling — throw, try, catch](#10-basic-exception-handling--throw-try-catch)
- [11. Exceptions, Functions, and Stack Unwinding](#11-exceptions-functions-and-stack-unwinding)
- [12. Uncaught Exceptions and Catch-All Handlers](#12-uncaught-exceptions-and-catch-all-handlers)
- [13. Exception Classes and Inheritance](#13-exception-classes-and-inheritance)
- [14. Exception Specifications and noexcept](#14-exception-specifications-and-noexcept)
- [15. Friend Non-Member Functions](#15-friend-non-member-functions)
- [16. Stream Classes for Strings (stringstream)](#16-stream-classes-for-strings-stringstream)
- [17. Carried-Over Topic from Topic 6 PPT: Multiple Inheritance, Virtual Base Classes, and the Rule of Zero](#17-carried-over-topic-from-topic-6-ppt-multiple-inheritance-virtual-base-classes-and-the-rule-of-zero)
- [18. Namespaces](#18-namespaces)
- [19. Week 7 Comprehensive Cheat Sheet](#19-week-7-comprehensive-cheat-sheet)
- [20. Top Five Takeaways for Week 7](#20-top-five-takeaways-for-week-7)

> UCI ICS 45C: Programming in C++ (35770)
> These notes integrate the Week 7 reading material: LearnCpp 11.6, 11.7 (function templates), 26.1, 26.2 (template classes and non-type parameters), 20.6, 20.7 (lambdas and captures), 27.1–27.5 and 27.9 (exception handling and `noexcept`), 15.8 (friend non-member functions), and 28.4 (stream classes for strings). Content is organized by concept.
> Professor Klefstad's *Topic 6* PPT was the only PPT bundled with this week; most of its content (inheritance, virtual functions, abstract classes, virtual destructors, the Shape/Picture framework) was already integrated into the Week 6 notes. The remaining slides from that PPT — covering **multiple inheritance and virtual base classes** (slides 27, 29–31, 33) — are revisited here in section 17 since the Week 6 notes had flagged them as "may belong to Week 7."
> Additional content from Klefstad's *Topic 7* PPT — the **Rule of Zero** (§17.8), **template specialization via non-template overload** (§4.13), the **revised function resolution algorithm** (§4.14), **parameter matching rules** (§4.15), **template parameter defaults** (§5.8), **member templates** (§5.9), and **namespaces** (§18) — is integrated alongside the LearnCpp material.

---

## 1. Weekly Learning Objectives

> Bird's-eye view of the five conceptual blocks of Week 7

### 1.1 Templates (chapters 11.6–11.7 + 26.1–26.2)

- Understand: **why templates exist** — to avoid manually writing one overload per type
- Master: the `template <typename T>` syntax for **function templates**
- Master: how the compiler **instantiates** a template at the call site (and where it places the generated function)
- Understand: **template argument deduction** vs. explicitly specifying `<T>`
- Master: writing **class templates** (e.g. `Array<T>`)
- Understand: why template definitions usually live in **header files** (linker issues with splitting)
- Learn: **non-type template parameters** — passing a `constexpr` value (like an array size) as a template argument

### 1.2 Lambdas (chapters 20.6–20.7)

- Understand: a lambda is an **anonymous function defined inline**
- Master: the `[ captures ] ( params ) -> ret { body }` syntax
- Distinguish: **capture by value** vs. **capture by reference**; the role of `mutable`
- Master: **default captures** `[=]`, `[&]`, and their combinations
- Understand: **dangling captured references** (lifetime traps)
- Be aware of: unintended copies of mutable lambdas (`std::function`, `std::ref`)

### 1.3 Exceptions (chapters 27.1–27.5, 27.9)

- Understand: **why exceptions exist** — they decouple error handling from normal control flow
- Master: the **`throw` / `try` / `catch`** triple and the rules for matching catch blocks
- Master: **stack unwinding** — how an exception propagates up the call stack
- Understand: what happens with **uncaught exceptions** (`std::terminate`)
- Master: the **catch-all handler** `catch(...)`
- Master: writing **exception classes** and using **`std::exception` / `std::runtime_error`**
- Understand: catching exception classes **by `const` reference** prevents slicing
- Understand: derived-class handlers must come **before** base-class handlers
- Master: the **`noexcept`** specifier and the four levels of exception safety guarantees

### 1.4 Friend Functions (chapter 15.8)

- Understand: a `friend` declaration **selectively grants access** to private/protected members
- Master: declaring a **friend non-member function** inside a class
- Best practice: **prefer non-friend non-member functions** when public-interface access suffices

### 1.5 Stringstreams (chapter 28.4)

- Understand: `std::stringstream` is a **stream backed by a `std::string` buffer**
- Master: `<<` to insert, `>>` to extract, `str()` to set/get the entire buffer
- Master: using stringstreams to **convert between strings and numbers**
- Master: how to **clear** a stringstream for reuse (`str("")` + `clear()`)

---

## 2. The Motivation for Generic Programming

> Corresponds to LearnCpp 11.6 — opening

### 2.1 The Problem: Type-Bound Overloads

Suppose you want a function `max` that returns the larger of two numbers. Writing it for `int`:

```cpp
int max(int x, int y)
{
    return (x < y) ? y : x;
    // Note: we use < instead of > because std::max uses <
}
```

This only works for `int`. To support `double` you must write a near-identical overload:

```cpp
double max(double x, double y)
{
    return (x < y) ? y : x;
}
```

Repeating this for `long`, `long double`, and every user-defined type is:

- A maintenance burden (DRY violation)
- A recipe for bugs (copy-paste mistakes)
- **Inherently incomplete** — you can never anticipate every user type

> 💡 **Key Insight**
> The compiler can use a single template to generate a family of related functions or classes, each using a different set of actual types.

### 2.2 The Stencil Analogy

LearnCpp's mental model: think of a template as a **stencil**.

A stencil is a thin sheet of plastic or cardboard with a shape cut out. You lay it on a surface and spray paint through the hole — the same stencil can produce the same shape in red, blue, or green. The **color is not determined when you make the stencil**, only when you use it.

A C++ template is the same idea. The template author writes the *pattern* once. When the user calls it with `<int>`, the compiler stencils out an `int` version; when called with `<double>`, it stencils out a `double` version. The author doesn't need to know in advance what types will be passed in.

> 💡 **Key Insight**
> Templates can work with types that didn't even exist when the template was written. This makes template code both flexible and future-proof.

### 2.3 Python Comparison

| | Python | C++ |
|---|---|---|
| Generic-by-default | Yes — `def max(x, y)` works for any comparable type because Python is dynamically typed | No — every parameter type is checked statically |
| How to achieve genericity | Built-in (duck typing) | Use templates |
| When type checking happens | At runtime (or in a separate static checker like mypy) | At compile time (when the template is instantiated) |
| Failure mode | `TypeError` at runtime | Compile error at instantiation |

In Python, `def my_max(x, y): return x if x > y else y` "just works" for any pair of comparable values. C++ has stronger compile-time type checking, so we need **templates** to recover that flexibility.

### 2.4 Three Kinds of Template Parameters

> Corresponds to LearnCpp 11.6 "For advanced readers"

C++ supports three kinds of template parameters:

1. **Type template parameters** — placeholder for a type (most common; this is what `typename T` is)
2. **Non-type template parameters** — placeholder for a `constexpr` value (e.g. an integer used as an array size); covered in section 6
3. **Template template parameters** — placeholder for a template itself (very advanced; not on the syllabus)

---

## 3. Function Templates: Syntax and Semantics

> Corresponds to LearnCpp 11.6 (full chapter)

### 3.1 Anatomy of a Function Template

A **function template** is a *function-like definition* that the compiler uses to generate concrete functions on demand. The template itself is **not** compiled into executable code — only its instantiations are.

To convert the integer `max` to a function template:

```cpp
template <typename T>             // template parameter declaration
T max(T x, T y)                   // function template definition
{
    return (x < y) ? y : x;
}
```

Two ingredients:

1. The **template parameter declaration** `template <typename T>` introduces a placeholder type `T`. Its scope is strictly the immediately following function (or class) definition.
2. Every occurrence of the actual type we want to be generic (here, the parameter types and the return type) is replaced with `T`.

### 3.2 `typename` vs. `class`

You will see both spellings:

```cpp
template <typename T> void foo(T x);
template <class T>    void foo(T x);   // same thing
```

There is **no semantic difference** in this context. `typename` was added later and is preferred because it makes clear that `T` can be any type (including fundamental types like `int`, not just class types).

### 3.3 Naming Type Template Parameters

> Corresponds to LearnCpp 11.6 — Best practice

For **trivial** uses where `T` can be any reasonable type:

```cpp
template <typename T>     // T, U, V, ...
T max(T x, T y);
```

> ⚠️ **Best Practice**
> Use a single capital letter starting with `T` (e.g. `T`, `U`, `V`) to name type template parameters that are used in trivial or obvious ways and represent "any reasonable type."
>
> If the type template parameter has non-obvious usage or specific requirements, use a more descriptive name (e.g. `Allocator` or `TAllocator`).

### 3.4 Worked Example with a User-Defined Type

The function template `max<T>` can work with **anything that supports `operator<`**, including types that didn't exist when `max` was written. For example, given a class `Fraction` with a defined `operator<`, you could call `max<Fraction>(a, b)` and the compiler would stencil out an appropriate version.

> 💡 **Key Insight**
> The requirements on a type template parameter are **implicit**: whatever operations are used inside the template body must be valid for the type you instantiate with. If you instantiate `max<T>` with a type that has no `operator<`, the compile error appears *inside the instantiated function*, not at the template definition itself.

This is one reason template error messages can be intimidating — the compiler shows you the failing line inside the stenciled-out version, not the spot in your code that triggered the failure.

---

## 4. Function Template Instantiation

> Corresponds to LearnCpp 11.7 (full chapter)

### 4.1 Calling a Function Template

Three calling syntaxes:

```cpp
template <typename T>
T max(T x, T y) { return (x < y) ? y : x; }

int main()
{
    std::cout << max<int>(1, 2) << '\n';  // explicit: stencil for int
    std::cout << max<>(1, 2)    << '\n';  // empty: deduce T from arguments, prefer template
    std::cout << max(1, 2)      << '\n';  // bare: deduce T, may prefer non-template overload
    return 0;
}
```

### 4.2 The Vocabulary

| Term | Meaning |
|---|---|
| **Primary template** | The template definition itself, with type parameters |
| **Instantiation** | The compiler-driven process of generating a concrete function from the template |
| **Implicit instantiation** | Instantiation triggered by a function call |
| **Specialization / function instance** | The concrete function that was generated |

> 💡 **Nomenclature note from LearnCpp**
> "Specialization" most often refers to **explicit specialization** (the topic of 26.3) — manually defining a special version of the template for one specific type. The compiler-generated instance is also technically a specialization, but it's normally just called a *function instance*.

### 4.3 What the Compiler Actually Compiles

Given:

```cpp
template <typename T>
T max(T x, T y) { return (x < y) ? y : x; }

int main() {
    std::cout << max<int>(1, 2)    << '\n';
    std::cout << max<int>(4, 3)    << '\n';
    std::cout << max<double>(1, 2) << '\n';
}
```

The compiler effectively rewrites this to:

```cpp
template <typename T>
T max(T x, T y);   // declaration only

template<>
int max<int>(int x, int y) { return (x < y) ? y : x; }       // stenciled

template<>
double max<double>(double x, double y) { return (x < y) ? y : x; }  // stenciled

int main() {
    std::cout << max<int>(1, 2)    << '\n';
    std::cout << max<int>(4, 3)    << '\n';   // reuses instance
    std::cout << max<double>(1, 2) << '\n';
}
```

Two important rules:

1. A function template is **instantiated only on first use** in each translation unit. Subsequent calls reuse the existing instance.
2. If a function template is never called, it is **never instantiated** and therefore never compiled into the object file.

### 4.4 Template Argument Deduction

When the call site arguments already match the desired type, you can omit the explicit `<T>`:

```cpp
std::cout << max<int>(1, 2) << '\n';   // explicit
std::cout << max<>(1, 2)    << '\n';   // deduced
std::cout << max(1, 2)      << '\n';   // deduced, plus considers non-template overloads
```

The difference between `max<>` and `max`:

- `max<>(1, 2)` — the empty angle brackets tell the compiler to **only consider template overloads** when resolving the call.
- `max(1, 2)` — bare syntax considers **both template and non-template** overloads. If a non-template `max(int, int)` exists and is equally good, the **non-template version wins**.

> 💡 **Key Insight**
> The normal function call syntax will prefer a non-template function over an equally viable function instantiated from a template.

Why the preference? A non-template function is **specialized**: it can have a hand-tuned implementation for its specific types. A template instance must be *generic* and may be less optimized. Example:

```cpp
template <typename T>
void print(T x) { std::cout << x; }

void print(bool x) { std::cout << std::boolalpha << x; }  // prints "true"/"false"

print<bool>(true);  // prints 1   — template version forced
print<>(true);      // prints 1   — template-only consideration
print(true);        // prints true — non-template wins
```

> ⚠️ **Best Practice**
> Favor the normal function call syntax `max(1, 2)` when calling template-instantiated functions, unless you specifically need the template version to be preferred over a matching non-template.

### 4.5 Function Templates with Non-Template Parameters

You can mix template and non-template parameters:

```cpp
template <typename T>
int someFcn(T, double)  // T is generic; double is fixed; int is the return type
{
    return 5;
}

someFcn(1, 3.4);      // matches someFcn<int>(int, double)
someFcn(1, 3.4f);     // float promoted to double — matches someFcn<int>(int, double)
someFcn(1.2, 3.4);    // matches someFcn<double>(double, double)
someFcn(1.2f, 3.4);   // matches someFcn<float>(float, double)
```

### 4.6 Instantiated Functions May Not Compile (Syntactic Failure)

```cpp
template <typename T>
T addOne(T x) { return x + 1; }

int main() {
    std::string hello { "Hello, world!" };
    std::cout << addOne(hello) << '\n';   // ERROR: std::string + int is ill-formed
}
```

The compiler sees that no non-template `addOne(std::string)` exists, finds the template, and tries to stencil out `addOne<std::string>`. That fails because `std::string + 1` is not valid syntax. The cure is simply not to call it with a `std::string`.

### 4.7 Instantiated Functions May Not Make Sense Semantically (Syntactic Success!)

```cpp
template <typename T>
T addOne(T x) { return x + 1; }

int main() {
    std::cout << addOne("Hello, world!") << '\n';   // surprise: this compiles!
}
```

Output:

```
ello, world!
```

`addOne("Hello, world!")` deduces `T = const char*` (a pointer). Pointer arithmetic is valid C++, so `"Hello, world!" + 1` becomes a pointer one past the first character — producing `"ello, world!"`. The compiler doesn't know this is *semantically* nonsense.

> ⚠️ **Warning**
> The compiler will instantiate and compile function templates that don't make sense semantically as long as they are syntactically valid. It is *your* responsibility to call templates with sensible arguments.

> 🔧 **For advanced readers** — disallowing certain instantiations
> Using template specialization plus `= delete`, you can forbid specific argument types:
> ```cpp
> template <>
> const char* addOne(const char* x) = delete;   // emits a compile error if called
> ```

### 4.8 Default Arguments for Non-Template Parameters

Just like normal functions, function templates can have default arguments for their non-template parameters:

```cpp
template <typename T>
void print(T val, int times = 1)
{
    while (times--)
        std::cout << val;
}

print(5);        // prints "5"
print('a', 3);   // prints "aaa"
```

### 4.9 ⚠️ Static Local Variables in Function Templates

Each instantiation gets its **own independent copy** of any static local variable:

```cpp
template <typename T>
void printIDAndValue(T value)
{
    static int id { 0 };           // each instance has its OWN id
    std::cout << ++id << ") " << value << '\n';
}

int main() {
    printIDAndValue(12);    // 1) 12      — printIDAndValue<int> instance
    printIDAndValue(13);    // 2) 13      — same instance, id is now 2
    printIDAndValue(14.5);  // 1) 14.5    — printIDAndValue<double> instance with its OWN id
}
```

The `<int>` and `<double>` versions each have their own private `id` counter.

> ⚠️ **Warning**
> If a function template contains a *modifiable* static local variable, every instantiation gets its own independent copy. This is rarely what you want.

### 4.10 Generic Programming

When template type parameters can be replaced with anything, they're sometimes called **generic types**, and the act of writing templates is called **generic programming**. The mental shift: instead of focusing on type information, you focus on **algorithm logic and data structure design**.

### 4.11 Drawbacks of Templates

LearnCpp closes the chapter with a candid list of downsides:

1. **Code bloat**: each instantiation produces a copy of the code, which can slow compile and link times.
2. **Cryptic error messages**: failed instantiations produce notoriously hard-to-read errors that often run for dozens of lines.

> ⚠️ **Best Practice**
> Use function templates to write generic code that can work with a wide variety of types whenever the need arises. Start with a normal function, and refactor into a template when you need a second overload for a different type.

### 4.12 Python Comparison

| | Python | C++ Function Template |
|---|---|---|
| Type genericity | Built-in via duck typing | Opt-in via `template <typename T>` |
| Cost | None (interpreter handles it) | Compile-time code generation per type |
| Error timing | At runtime (when an unsupported operation is attempted) | At compile time (when the template is instantiated) |
| Error clarity | Often clear (`TypeError: '<' not supported between …`) | Often cryptic (multi-page template stack trace) |

### 4.13 Specializing a Template via a Non-Template Overload

> Corresponds to Klefstad's Topic 7 PPT — "Specializing a Template Function"

Templates produce a *generic* implementation. That implementation is sometimes **wrong** or **inefficient** for a particular type. The PPT's classic example is `min` applied to C-strings:

```cpp
template <typename T>
T min(T a, T b) {
    return a < b ? a : b;
}

int   x = min(10, 20);       // OK: Type is int
double y = min(10.5, 20.8);  // OK: Type is double

// But for C-strings…
const char* p = min("apple", "banana");
// Template instantiates min<const char*>(const char*, const char*)
// which compares POINTERS, not strings. Almost never what you want.
```

The fix: add a **non-template overload** that handles the special case:

```cpp
char* min(char* a, char* b) {
    return strcmp(a, b) < 0 ? a : b;     // compare string CONTENTS
}
```

Now:
- A call with `char*` arguments picks the non-template `min(char*, char*)`.
- A call with any other type still goes through the template.

> 💡 **Key Insight**
> Klefstad's slides call this "specializing the template," but technically C++ also offers **explicit template specialization** (`template <> char* min(char*, char*) { … }`). The non-template overload version is simpler, plays nicely with overload resolution, and is what the PPT shows.

### 4.14 Revised Function Resolution Algorithm

> Corresponds to Klefstad's Topic 7 PPT — "Revised Function Resolution Algorithm"

When a call site has both non-template overloads and a function template available, the compiler resolves it in this order:

1. **Gather all non-template functions** that match the call (exact argument types).
2. If more than one matches → **ambiguity error**.
3. If exactly one matches → **select it**.
4. If none matched, **examine all template instances** that can be generated for the call.
5. If more than one template can match → **ambiguity error**.
6. If exactly one template matches → **instantiate it (if not already) and select it**.
7. If still none match, **re-examine the non-templates allowing implicit type conversions**.

> 💡 **Key Insight**
> Non-template overloads with **exact** type match win first. Templates are tried before non-templates that would require **conversions**. This is why a hand-written `min(char*, char*)` beats the templated `min<const char*>` for C-strings.

This is why the `print(true)` example in §4.4 prints `true` instead of `1`: the non-template `print(bool)` matches exactly, so it wins over the template.

### 4.15 Parameter Matching Rules (const & reference correctness)

> Corresponds to Klefstad's Topic 7 PPT — "Parameter Matching"

These rules apply to **all** function calls (template or not) but are especially relevant when templates deduce reference / const-qualified types.

| Formal parameter | Matches non-const actual? | Matches const actual? | Matches a literal? |
|------------------|:--:|:--:|:--:|
| `T` (by value)        | ✓ | ✓ | ✓ |
| `T&` (non-const ref)  | ✓ (must be l-value) | ✗ | ✗ |
| `const T&`            | ✓ | ✓ | ✓ (creates an anonymous temporary) |
| `T*`                  | ✓ | ✗ | depends |
| `const T*`            | ✓ | ✓ | ✓ |

**Worked examples:**

```cpp
// 1. Non-const formal CANNOT bind to a const actual
strcat("Hello", "World");        // ERROR: literals are const char[], strcat takes char*

// 2. const formal accepts both const and non-const
int len1 = strlen("Hello");      // OK: literal is const
char s[] = "Hello";
int len2 = strlen(s);            // OK: array decays to char*, conversion to const char* is fine

// 3. const T& creates an anonymous temporary for literals
template <typename T>
void print(const T& x) { std::cout << x; }
print(10);                       // OK: temporary int(10) bound to const int&

// 4. Plain T& needs a real l-value
template <typename T>
void swap(T& a, T& b) { /* ... */ }
int x = 10, y = 20;
swap(x, y);                      // OK: x and y are l-values
swap(10, 20);                    // ERROR: literals are r-values
```

> ⚠️ **Best Practice**
> When a template parameter is intended for reading only, prefer `const T&` — it accepts everything (l-values, r-values, const, non-const) and avoids copies for large objects. Use plain `T&` only when the function must **modify** the caller's object.

---

## 5. Template Classes (Class Templates)

> Corresponds to LearnCpp 26.1 (full chapter)

### 5.1 Motivating Example: From IntArray to Array&lt;T&gt;

Suppose you have an `IntArray` class for managing a dynamic array of `int`:

```cpp
class IntArray
{
private:
    int  m_length{};
    int* m_data{};

public:
    IntArray(int length)
    {
        assert(length > 0);
        m_data   = new int[length]{};
        m_length = length;
    }

    IntArray(const IntArray&)            = delete;
    IntArray& operator=(const IntArray&) = delete;

    ~IntArray() { delete[] m_data; }

    void erase()
    {
        delete[] m_data;
        m_data   = nullptr;        // important — see Rule of Three discussion
        m_length = 0;
    }

    int& operator[](int index)
    {
        assert(index >= 0 && index < m_length);
        return m_data[index];
    }

    int getLength() const { return m_length; }
};
```

What if we want a `DoubleArray`? Copy-paste, replace `int` with `double` — a maintenance nightmare. Templates rescue us:

```cpp
#ifndef ARRAY_H
#define ARRAY_H

#include <cassert>

template <typename T>                   // added
class Array
{
private:
    int m_length{};
    T*  m_data{};                       // type T instead of int

public:
    Array(int length)
    {
        assert(length > 0);
        m_data   = new T[length]{};     // allocate T objects
        m_length = length;
    }

    Array(const Array&)            = delete;
    Array& operator=(const Array&) = delete;

    ~Array() { delete[] m_data; }

    void erase()
    {
        delete[] m_data;
        m_data   = nullptr;
        m_length = 0;
    }

    // member function declared here, defined outside
    T& operator[](int index);

    int getLength() const { return m_length; }
};

// Member functions defined outside the class need their own template declaration
template <typename T>
T& Array<T>::operator[](int index)
{
    assert(index >= 0 && index < m_length);
    return m_data[index];
}

#endif
```

Usage:

```cpp
Array<int>    intArray { 12 };
Array<double> doubleArray { 12 };
```

### 5.2 Two Critical Syntactic Rules

1. Each member function defined **outside** the class body needs its **own** `template <typename T>` declaration.
2. The **class name with template arguments** is `Array<T>` (used in `T& Array<T>::operator[](…)`); inside the class body, plain `Array` refers to the current instantiation (e.g. inside the copy constructor signature).

### 5.3 Instantiation Rules (Same as Function Templates)

- A class template is instantiated **on first use** for each set of template arguments.
- If you never use `Array<float>` anywhere, no `Array<float>` code is generated.
- Each instantiation is a distinct type: `Array<int>` and `Array<double>` are **not interchangeable** and have no special relationship to each other.

### 5.4 Why Container Classes Love Templates

`std::vector`, `std::array`, `std::map`, `std::set`, … the entire standard container library is built from class templates. It's the canonical use case: write the container algorithm once, instantiate it for whatever payload type the user needs.

### 5.5 Splitting Up Template Classes — The Linker Trap

> Corresponds to LearnCpp 26.1 — "Splitting up template classes"

For non-template classes, the conventional layout is:

- **`.h`** file: class definition + member function declarations
- **`.cpp`** file: member function definitions

If you try the same layout with a template class:

**Array.h** (class template + declarations):
```cpp
template <typename T>
class Array {
    /* ... */
    T& operator[](int index);   // declaration only
};
```

**Array.cpp** (member function definitions):
```cpp
#include "Array.h"

template <typename T>
T& Array<T>::operator[](int index) { /* ... */ }
```

**main.cpp** (user code):
```cpp
#include "Array.h"

int main() {
    Array<int> a{10};
    a[0] = 5;       // uses Array<int>::operator[]
}
```

You will get a **linker error**:

```
undefined reference to `Array<int>::operator[](int)'
```

### 5.6 Why the Linker Fails

C++ compiles files **independently**:

1. When **`main.cpp`** is compiled, the contents of `Array.h` are textually included. The compiler sees `Array<int> a{10}` and needs to instantiate `Array<int>` — but it only has the **declaration** of `operator[]`, not the definition. So it generates a **call** to `Array<int>::operator[]` and trusts the linker to find the body.
2. When **`Array.cpp`** is compiled, the contents of `Array.h` are textually included, plus the template definition of `operator[]`. But the compiler has **no reason** to instantiate `Array<int>` here — nothing in `Array.cpp` actually uses `Array<int>`. So no `Array<int>::operator[]` body is generated.
3. At link time, `main.o` calls `Array<int>::operator[]`, but no `.o` file contains its body. **Linker error.**

> 💡 **Key Insight**
> To instantiate a template, the compiler needs to see **both** the full template definition (not just a declaration) **and** the specific template type required, in the **same** translation unit.

### 5.7 The Three Workarounds

**Solution 1 (preferred):** Put **all** template code in the header.

```cpp
// Array.h
template <typename T>
class Array { /* ... */ };

template <typename T>
T& Array<T>::operator[](int index) { /* ... */ }   // definition in the header too
```

The downside is that if many translation units use the same template, each one will instantiate its own copy — but the linker typically merges these and the executable does not get bloated.

**Solution 2:** Move the implementations to a `.inl` file (`.inl` = "inline") and include it at the bottom of the header.

```cpp
// Array.h
template <typename T>
class Array { /* ... */ };

#include "Array.inl"   // included inside the header guard, at the bottom
```

> 🛠️ **Tip**
> If your build system mistakenly tries to compile the `.inl` file as if it were a `.cpp`, you'll get "duplicate definition" errors. Exclude `.inl` files from the build: in Visual Studio, set *Exclude From Build → Yes*; in Code::Blocks, uncheck *Compile file* and *Link file*.

**Solution 3:** Use **explicit instantiation** in a separate file:

```cpp
// templates.cpp
#include "Array.h"
#include "Array.cpp"   // breaking best practice, but only here

template class Array<int>;     // force instantiation of Array<int>
template class Array<double>;  // force instantiation of Array<double>
```

The `template class Array<int>;` directive forces the compiler to stencil out every member of `Array<int>` inside `templates.cpp`. Other translation units can then include only `Array.h` and the linker will resolve their calls against `templates.o`.

This is more efficient at scale but requires you to enumerate every needed instantiation by hand.

### 5.8 Template Parameter Defaults

> Corresponds to Klefstad's Topic 7 PPT — "Template Parameter Defaults"

Just like default function arguments, template parameters can have **default values**:

```cpp
template <typename CharType = char, int Capacity = 100>
class basic_string {
    // can have a string of wchar_t too, but default is a char string
};

basic_string<>          s;       // CharType = char,    Capacity = 100
basic_string<wchar_t>   ws;      // CharType = wchar_t, Capacity = 100  (default capacity)
basic_string<char, 256> big;     // both supplied explicitly
```

This pattern is everywhere in the standard library:

- `std::basic_string<CharT, Traits = char_traits<CharT>, Alloc = allocator<CharT>>`
  - `std::string`  = `std::basic_string<char>`
  - `std::wstring` = `std::basic_string<wchar_t>`
- `std::vector<T, Allocator = std::allocator<T>>`
- `std::set<Key, Compare = std::less<Key>, Allocator = std::allocator<Key>>`

> 💡 **Key Insight**
> Defaults let library authors expose a simple `Foo<MyType>` interface while still allowing power users to swap out allocators, comparators, traits, etc.

> ⚠️ **Best Practice**
> If you provide defaults, the **last** template parameter must be the most-customizable one (same rule as default function arguments — defaults at the end only).

### 5.9 Member Templates

> Corresponds to Klefstad's Topic 7 PPT — "Member Templates"

A class doesn't have to be a template for its **member functions** to be templates. A regular class can have a **template member function** — often used for "accept any type" methods and conversion operators.

The PPT's motivating example: what if `std::ostream::operator<<` was defined like this?

```cpp
class ostream {
public:
    ostream& operator<<(const int& item) {       // ordinary overload for int
        // ...
        return *this;
    }

    template <typename T>                         // member template for everything else
    ostream& operator<<(const T& item) {
        item.print(*this);   // requires T to have a print(ostream&) method
        return *this;
    }
};
```

Any user class can then plug into `cout << myObj` simply by writing a `print(ostream&)` method — no need to globally overload `operator<<` for each new type.

Real-world example — `std::shared_ptr` has a member template constructor that lets a `shared_ptr<Derived>` convert to a `shared_ptr<Base>`:

```cpp
template <typename T>
class shared_ptr {
public:
    template <typename U>           // member template — U is independent of T
    shared_ptr(const shared_ptr<U>& other) { /* ... if U* converts to T* ... */ }
};

std::shared_ptr<Derived> dp = std::make_shared<Derived>();
std::shared_ptr<Base>    bp = dp;   // uses the member template constructor
```

> 💡 **Key Insight**
> A member template is parameterized **independently** of the enclosing class (or its template parameters). You can have a non-template class with template members, a template class with **non-template** members, or a template class with **further** template members — every combination is legal.

---

## 6. Template Non-Type Parameters

> Corresponds to LearnCpp 26.2 (full chapter)

### 6.1 What Is a Non-Type Parameter?

A **template non-type parameter** is a template parameter whose *type* is fixed at the declaration site, but whose *value* is supplied as a `constexpr` template argument.

It can be any of these types:

- An integral type (e.g. `int`, `std::size_t`)
- An enumeration type
- A pointer or reference to a class object
- A pointer or reference to a function
- A pointer or reference to a class member function
- `std::nullptr_t`
- A floating-point type (since C++20)

### 6.2 Worked Example: StaticArray

```cpp
template <typename T, int size>     // size is a non-type parameter
class StaticArray
{
private:
    T m_array[size] {};             // uses size as the array bound — no new[] needed!

public:
    T* getArray();
    T& operator[](int index) { return m_array[index]; }
};

// Member function defined outside also lists the non-type parameter
template <typename T, int size>
T* StaticArray<T, size>::getArray() { return m_array; }

int main() {
    StaticArray<int, 12>   intArray;       // m_array is int[12]
    StaticArray<double, 4> doubleArray;    // m_array is double[4]

    for (int i = 0; i < 12; ++i) intArray[i] = i;
    for (int i = 0; i < 4;  ++i) doubleArray[i] = 4.4 + 0.1 * i;
}
```

> 💡 **Key Insight**
> Because `size` is a `constexpr` value visible at compile time, the compiler can lay out `m_array` as a **fixed-size built-in array** — no dynamic allocation, no separate length field. This is exactly how `std::array<int, 5>` works: `int` is the type parameter, `5` is the non-type parameter.

### 6.3 Non-Type Arguments Must Be constexpr

```cpp
template <int size>
class Foo { };

int main() {
    int x { 4 };       // not constexpr
    Foo<x> f;          // ERROR: template non-type argument must be constexpr

    constexpr int y { 4 };
    Foo<y> g;          // OK
}
```

The compiler must know the exact value at compile time so it can stencil the class.

### 6.4 Python Comparison

Python has no direct analog. Python lists don't have a compile-time fixed size; numpy arrays come close but use runtime shapes. C++'s `std::array<T, N>` and the non-type parameter pattern are essentially a way to get **type-level encoding of sizes** so the array bound is part of the type itself.

```python
# Python: size is a runtime value
arr = [0] * 12

# numpy: size is a runtime value, though shape can be checked
import numpy as np
arr = np.zeros(12, dtype=int)
```

```cpp
// C++: size is part of the type
StaticArray<int, 12> arr;
// StaticArray<int, 12> and StaticArray<int, 13> are DIFFERENT TYPES
```

---

## 7. Lambdas — Anonymous Functions

> Corresponds to LearnCpp 20.6 (full chapter)

### 7.1 The Problem They Solve

Standard library algorithms like `std::find_if`, `std::sort`, and `std::count_if` accept a function as one of their arguments. Without lambdas, you'd have to write a free function for every one-off predicate, give it a name, and put it in global scope:

```cpp
bool containsNut(std::string_view str)
{
    return str.find("nut") != std::string_view::npos;
}

auto found = std::find_if(arr.begin(), arr.end(), containsNut);
```

This is wasteful for two reasons:

- The function is **used once** but lives at global scope forever.
- The function is **shorter than its name** — by the time you've read "containsNut", you could have read the body.

### 7.2 Lambda Syntax

```
[ captureClause ] ( parameters ) -> returnType
{
    statements;
}
```

- The **capture clause** can be empty: `[]`.
- The **parameters** can be omitted entirely if you have no parameters *and* no return type spec: `[]{}`.
- The **return type** is optional; if omitted, `auto` (return-type deduction) kicks in.

> 🧪 **As an aside…**
> The most trivial possible lambda: `[] {};` — empty captures, no parameters, omitted return type. Does nothing.

A lambda is also called a **closure** or, when used inline as an argument, a **function literal**.

### 7.3 Rewriting the Find Example

```cpp
auto found = std::find_if(arr.begin(), arr.end(),
                          [](std::string_view str) {
                              return str.find("nut") != std::string_view::npos;
                          });
```

> ⚠️ **Best Practice**
> Following the principle of defining things in the smallest scope and closest to first use, lambdas are preferred over normal functions when you need a trivial, one-off function to pass as an argument.

### 7.4 Storing a Lambda in a Variable

> 💡 **About `std::all_of`** — returns `true` iff the predicate holds for every element in the range. Full algorithm catalog is in Week 8 §11.6 (predicate algorithms).

```cpp
// Inline (function literal):  hard to read
return std::all_of(array.begin(), array.end(),
                   [](int i){ return (i % 2) == 0; });

// Named:  clearer intent
auto isEven {
    [](int i) {
        return (i % 2) == 0;
    }
};
return std::all_of(array.begin(), array.end(), isEven);
```

The named-lambda version reads naturally: "return whether *all of* the elements in the *array* are *even*".

> 💡 **Key Insight**
> Storing a lambda in a variable gives the lambda a useful name (improving readability) and lets you reuse it.

### 7.5 The Type of a Lambda

A lambda's type is **a unique, unnamed type generated by the compiler**. You can't write the type out by hand.

> 🔧 **For advanced readers**
> Lambdas aren't really functions — they're **functors** (objects with an overloaded `operator()`). When the compiler encounters a lambda definition, it generates a hidden class type with the captures as data members and the lambda body as `operator()`. This is how lambdas circumvent the lack of nested function support in C++.

Three ways to store a lambda for later use:

```cpp
#include <functional>

int main() {
    // (1) Plain function pointer — only works when the lambda has an empty capture
    double (*addNumbers1)(double, double) {
        [](double a, double b) { return a + b; }
    };

    // (2) std::function<Sig> — works even with captures, but adds overhead
    std::function addNumbers2 {     // pre-C++17: std::function<double(double, double)>
        [](double a, double b) { return a + b; }
    };

    // (3) auto — stores the lambda with its real type; zero overhead
    auto addNumbers3 {
        [](double a, double b) { return a + b; }
    };
}
```

Only `auto` preserves the **actual** lambda type with no overhead. `std::function` is more flexible (it can hold any callable with a matching signature) but pays a small price in indirection.

### 7.6 Passing a Lambda to a Function — Four Approaches

```cpp
// (1) std::function — flexible, but the implicit conversion adds overhead
void repeat1(int n, const std::function<void(int)>& fn) {
    for (int i = 0; i < n; ++i) fn(i);
}

// (2) Function template with type template parameter
template <typename T>
void repeat2(int n, const T& fn) {
    for (int i = 0; i < n; ++i) fn(i);
}

// (3) Abbreviated function template (C++20) — same as (2), cleaner syntax
void repeat3(int n, const auto& fn) {
    for (int i = 0; i < n; ++i) fn(i);
}

// (4) Plain function pointer — only for lambdas with NO captures
void repeat4(int n, void (*fn)(int)) {
    for (int i = 0; i < n; ++i) fn(i);
}
```

> ⚠️ **Best Practice**
> - **Storing** a lambda in a variable: use `auto`.
> - **Passing** a lambda to a function:
>   - If C++20 capable, use `auto` as the parameter type.
>   - Otherwise, use a type template parameter or `std::function`.
>   - Use a function pointer only if the lambda has no captures.

### 7.7 Generic Lambdas

Since C++14, lambda parameters can use `auto`:

```cpp
const auto sameLetter {
    std::adjacent_find(months.begin(), months.end(),
                       [](const auto& a, const auto& b) {
                           return a[0] == b[0];
                       })
};
```

The compiler treats each `auto` parameter as an implicit template parameter — these are called **generic lambdas**.

> 🔧 **For advanced readers**
> Inside a lambda, `auto` is just shorthand for a template parameter.

**When `auto` is and isn't a good choice:**

```cpp
// Good: auto deduces std::string_view, etc., and we only need operator[]
[](const auto& a, const auto& b) { return a[0] == b[0]; }

// Less good: auto deduces const char*, which is awkward to work with
// Better to be explicit:
[](std::string_view str) { return str.length() == 5; }
```

### 7.8 Constexpr Lambdas

> Since C++17

A lambda is **implicitly `constexpr`** if its result satisfies the requirements of a constant expression. Two conditions:

- No captures, or all captures are themselves `constexpr`.
- Every function it calls is `constexpr`.

Many standard library algorithms didn't become `constexpr` until C++20/C++23, so older code rarely makes use of this.

### 7.9 Generic Lambdas and Static Local Variables — A Familiar Trap

Same warning as for function templates: each instantiation of a generic lambda has **its own** static local variable.

```cpp
auto print {
    [](auto value) {
        static int callCount { 0 };          // not shared across types!
        std::cout << callCount++ << ": " << value << '\n';
    }
};

print("hello");      // 0: hello   — <const char*> instance
print("world");      // 1: world   — same instance
print(1);            // 0: 1       — <int> instance (different callCount!)
print(2);            // 1: 2
print("ding dong");  // 2: ding dong
```

If you want a shared counter across types, define a global or static variable **outside** the lambda — or, even better, **capture** a shared counter by reference (see section 8).

### 7.10 Return Type Deduction and Trailing Return Types

If you omit the return type, the compiler deduces it from the `return` statements — and **all** return statements must produce the same type:

```cpp
auto divide { [](int x, int y, bool intDivision) {
    if (intDivision)
        return x / y;                        // returns int
    else
        return static_cast<double>(x) / y;   // ERROR: returns double, mismatch with int
} };
```

Two fixes:

```cpp
// Fix 1: explicit casts so all branches return the same type
auto divide { [](int x, int y, bool intDiv) {
    if (intDiv) return static_cast<double>(x / y);
    else        return static_cast<double>(x) / y;
} };

// Fix 2 (usually better): explicit trailing return type, let the compiler convert
auto divide { [](int x, int y, bool intDiv) -> double {
    if (intDiv) return x / y;           // implicitly converted to double
    else        return static_cast<double>(x) / y;
} };
```

### 7.11 Standard Library Function Objects

For common operations you often don't need a lambda at all — the `<functional>` header provides ready-made function objects:

```cpp
#include <functional>
std::sort(arr.begin(), arr.end(), std::greater{});   // sort in descending order
```

Other common ones: `std::less`, `std::equal_to`, `std::plus`, `std::minus`, …

### 7.12 Conclusion

Lambdas plus the algorithms library let you express logic that would otherwise be a hand-written loop in a small number of lines. They're not a universal replacement, though — for non-trivial or reusable logic, prefer a named regular function.

### 7.13 Python Comparison

| | Python | C++ Lambda |
|---|---|---|
| Syntax | `lambda x, y: x + y` | `[](int x, int y) { return x + y; }` |
| Body | Single expression only | Full statement block |
| Captures | Implicit (closures over surrounding names) | Explicit via capture clause `[]` |
| Type | All callables share a duck-typed interface | Each lambda has a unique compiler-generated type |

C++ lambdas are **strictly more capable** than Python lambdas (which are limited to a single expression), but **less convenient** at the call site because captures must be enumerated.


---

## 8. Lambda Captures

> Corresponds to LearnCpp 20.7 (full chapter)

### 8.1 Why Captures Exist

By default, a lambda **cannot** see local variables from its enclosing function:

```cpp
std::string search{};
std::cin >> search;

auto found = std::find_if(arr.begin(), arr.end(),
                          [](std::string_view str) {
                              return str.find(search) != std::string_view::npos;
                              // ERROR: 'search' not accessible in this scope
                          });
```

A lambda is **not** an inner block — it's a separate object generated by the compiler. The variables it can see for free are:

- Objects with **static** (or **thread_local**) storage duration — globals, static locals
- Objects that are **`constexpr`** (explicitly or implicitly)

Everything else must be explicitly **captured**.

> 🛠️ **Tip**
> Lambdas can only access certain kinds of objects that have been defined outside the lambda, including those with static storage duration (e.g. global variables and static locals) and `constexpr` objects.

### 8.2 The Capture Clause

To give the lambda access to `search`, list it inside the `[]`:

```cpp
auto found = std::find_if(arr.begin(), arr.end(),
                          [search](std::string_view str) {
                              return str.find(search) != std::string_view::npos;
                          });
```

### 8.3 How Captures Actually Work — They're Copies

When a lambda definition executes, **for each captured variable, the lambda makes a clone** with the same name, initialized from the outer-scope value at that moment.

> 💡 **Key Insight**
> The captured variables of a lambda are **copies** of the outer-scope variables, not the actual variables.

The cloned variables live inside the **lambda object** itself (as data members of the compiler-generated functor). They have the same name as the originals but may not have the same type.

> 🔧 **For advanced readers**
> When the compiler sees `[search]`, it generates a hidden class with a data member `search`. When the lambda definition is reached at runtime, an object of that hidden class is constructed and its `search` member is initialized from `main`'s `search`. The lambda's body runs as an `operator()` on that object.

### 8.4 Captures Are const by Default

By default the generated `operator()` is `const`, so you cannot modify captured-by-value variables:

```cpp
int ammo { 10 };

auto shoot {
    [ammo]() {        // captured by value
        --ammo;       // ERROR: ammo is const inside the lambda
        std::cout << "Pew! " << ammo << " shot(s) left.\n";
    }
};
```

### 8.5 Mutable Captures

The `mutable` keyword removes the `const` from the lambda's `operator()`:

```cpp
auto shoot {
    [ammo]() mutable {   // mutable allows modification of captured value
        --ammo;
        std::cout << "Pew! " << ammo << " shot(s) left.\n";
    }
};

shoot();   // Pew! 9 shot(s) left.
shoot();   // Pew! 8 shot(s) left.

std::cout << ammo << " shot(s) left\n";   // 10 — main's ammo is untouched!
```

Two important observations:

1. The lambda decrements **its own private copy** of `ammo`, not `main`'s `ammo`.
2. The state of that private copy **persists across calls** to the lambda (because the lambda is an object that holds it as a member).

> ⚠️ **Warning**
> Because captured variables are members of the lambda object, their values persist across multiple calls to the lambda!

### 8.6 Capture by Reference

Prefix with `&` to capture by reference:

```cpp
int ammo { 10 };

auto shoot {
    [&ammo]() {        // no need for mutable
        --ammo;        // affects main's ammo directly
        std::cout << "Pew! " << ammo << " shot(s) left.\n";
    }
};

shoot();
std::cout << ammo << " shot(s) left\n";   // 9 shot(s) left — main's ammo changed
```

Capture-by-reference variables are **non-const by default** (unless the original was `const`), so `mutable` is unnecessary.

**Counting comparisons in `std::sort`** is a textbook use case:

```cpp
int comparisons { 0 };

std::sort(cars.begin(), cars.end(),
          [&comparisons](const auto& a, const auto& b) {
              ++comparisons;       // no mutable needed!
              return a.make < b.make;
          });

std::cout << "Comparisons: " << comparisons << '\n';   // possible output: 2
```

### 8.7 Capturing Multiple Variables

Comma-separated; mix and match as needed:

```cpp
int health { 33 };
int armor  { 100 };
std::vector<CEnemy> enemies;

// Capture health and armor by value, enemies by reference
[health, armor, &enemies] () { /* ... */ };
```

### 8.8 Default Captures

> Corresponds to LearnCpp 20.7 — "Default captures"

A **default capture** auto-captures every variable mentioned in the lambda body. Two forms:

- **`[=]`** — default capture by value
- **`[&]`** — default capture by reference

Default captures only capture the variables that the lambda actually uses, not every variable in scope.

```cpp
auto found = std::find_if(areas.begin(), areas.end(),
                          [=](int knownArea) {
                              return width * height == knownArea;
                              // width and height are auto-captured by value
                          });
```

You can mix a default capture with explicit captures:

```cpp
int health { 33 };
int armor  { 100 };
std::vector<CEnemy> enemies;

[health, armor, &enemies]() { /* ... */ };   // explicit
[=, &enemies]()             { /* ... */ };   // enemies by ref, everything else by value
[&, armor]()                { /* ... */ };   // armor by value, everything else by ref

// ILLEGAL forms:
[&, &armor]() { };    // can't say "& by default" and then "& for armor" too
[=, armor]()  { };    // can't say "= by default" and then "= for armor" too
[armor, &health, &armor]() { };   // can't capture armor twice
[armor, &]()  { };    // the default capture must come FIRST
```

### 8.9 Defining New Variables in the Capture Clause

You can declare a new variable visible only inside the lambda, with its initial value computed once:

```cpp
auto found = std::find_if(areas.begin(), areas.end(),
                          // userArea is computed once when the lambda is defined
                          [userArea { width * height }](int knownArea) {
                              return userArea == knownArea;
                          });
```

> ⚠️ **Best Practice**
> Only initialize variables in the capture if their value is short and their type is obvious. Otherwise, define the variable outside the lambda and capture it normally.

### 8.10 ⚠️ Dangling Captured References

This is the most dangerous lambda pitfall:

```cpp
auto makeWalrus(const std::string& name)
{
    return [&]() {                              // captures 'name' by reference
        std::cout << "I am a walrus, my name is " << name << '\n';
    };
}                                               // 'name' is destroyed here!

int main() {
    auto sayName { makeWalrus("Roofus") };
    sayName();                                  // UB — uses dangling reference
}
```

What happens:

1. `makeWalrus("Roofus")` creates a temporary `std::string` from the literal.
2. The lambda captures `name` **by reference**.
3. When `makeWalrus` returns, `name` is destroyed.
4. The returned lambda still holds a dangling reference. Calling it is undefined behavior.

> ⚠️ **Warning**
> Be extra careful when capturing variables by reference, especially with a default reference capture `[&]`. The captured variables **must outlive the lambda**.

The fix is simply to capture by value (`[=]` or `[name]`).

### 8.11 ⚠️ Unintended Copies of Mutable Lambdas

A lambda is an object, so it can be copied — and a copy carries its **own** state.

```cpp
int i { 0 };
auto count { [i]() mutable { std::cout << ++i << '\n'; } };

count();                     // 1
auto otherCount { count };   // copy taken when count's i == 1
count();                     // 2 (count's i becomes 2)
otherCount();                // 2 (otherCount's i was 1, becomes 2)
```

This is sneakier when standard library functions copy the lambda for you:

```cpp
void myInvoke(const std::function<void()>& fn) { fn(); }

int i { 0 };
auto count { [i]() mutable { std::cout << ++i << '\n'; } };

myInvoke(count);   // 1
myInvoke(count);   // 1
myInvoke(count);   // 1
```

The lambda has a unique compiler-generated type that doesn't match `std::function<void()>`. To bind to the reference parameter, the compiler creates a **temporary `std::function`** that contains a **copy** of the lambda. Each call to `myInvoke(count)` makes a fresh copy, so the counter never advances past `1`.

**Fix 1** — store the lambda directly in a `std::function`:

```cpp
std::function count { [i]() mutable { std::cout << ++i << '\n'; } };
myInvoke(count);   // 1
myInvoke(count);   // 2  — no temporary copy is made
myInvoke(count);   // 3
```

**Fix 2** — wrap with `std::ref`:

```cpp
auto count { [i]() mutable { std::cout << ++i << '\n'; } };
myInvoke(std::ref(count));   // 1
myInvoke(std::ref(count));   // 2
myInvoke(std::ref(count));   // 3
```

`std::reference_wrapper` (created by `std::ref`) is treated like a reference, so copies of the wrapper still refer to the original lambda. Even more pleasantly: this works **even if** `myInvoke` takes `fn` by value.

> 📜 **Rule**
> Standard library functions may copy function objects (reminder: lambdas are function objects). If you want to provide lambdas with mutable captured variables, pass them by reference using `std::ref`.

> ⚠️ **Best Practice**
> Try to avoid mutable lambdas. Non-mutable lambdas are easier to understand and don't suffer from the above issues — or from the more serious issues that appear in parallel execution.

### 8.12 Python Comparison

| | Python | C++ |
|---|---|---|
| Capture semantics | Closure captures variables by **reference** (variable bindings, not values) | Explicit choice: by value `[x]` or by reference `[&x]` |
| Mutating an outer variable | Requires `nonlocal` keyword | Capture by reference, or `mutable` for value captures |
| Lifetime safety | GC keeps captured variables alive | Programmer is responsible — capturing by reference to a destroyed object is UB |

```python
# Python — captures 'x' by reference (the name x), late binding
funcs = []
for x in range(3):
    funcs.append(lambda: x)
print([f() for f in funcs])   # [2, 2, 2]  — all see the final x

# To capture by value, force evaluation at definition time:
funcs = [(lambda v: lambda: v)(x) for x in range(3)]
print([f() for f in funcs])   # [0, 1, 2]
```

```cpp
// C++ — explicit choice
for (int x = 0; x < 3; ++x) {
    auto f1 = [x] () { return x; };    // capture by value, snapshot of x
    auto f2 = [&x]() { return x; };    // capture by reference, sees x change
}
```

C++ trades convenience for clarity: every capture is explicit, and you can't get the Python late-binding surprise.

---

## 9. The Need for Exceptions

> Corresponds to LearnCpp 27.1 (full chapter)

### 9.1 Return Codes: The Old Way

The most common pre-exception error-handling style is the **return code** — a sentinel value (often `-1`, `nullptr`, or an enum) signaling that something went wrong:

```cpp
int findFirstChar(std::string_view s, char ch)
{
    for (std::size_t i = 0; i < s.length(); ++i)
        if (s[i] == ch)
            return static_cast<int>(i);
    return -1;     // not found
}
```

This is **simple**, but it accumulates pain quickly in non-trivial code.

### 9.2 Five Problems with Return Codes

**(1) Cryptic values.**
If a function returns `-1`, is that an error or a valid result? You can't tell without reading the docs.

**(2) The "two values" problem.**
What if you need to return *both* a result and an error code? You have to:

- Return one via an output parameter (ugly):

```cpp
double divide(int x, int y, bool& outSuccess)
{
    if (y == 0) { outSuccess = false; return 0.0; }
    outSuccess = true;
    return static_cast<double>(x) / y;
}

bool ok{};
double r = divide(5, 3, ok);
if (!ok) std::cerr << "error";
else     std::cout << r;
```

- Or build a custom struct of `{value, error}`, which adds boilerplate.

**(3) Mandatory error checking everywhere.**
Each call site needs an explicit check, hiding the actual logic:

```cpp
std::ifstream setupIni { "setup.ini" };
if (!setupIni)                                 return ERROR_OPENING_FILE;
if (!readIntegerFromFile(setupIni, p1))         return ERROR_READING_VALUE;
if (!readDoubleFromFile (setupIni, p2))         return ERROR_READING_VALUE;
if (!readFloatFromFile  (setupIni, p3))         return ERROR_READING_VALUE;
// imagine 20 more lines of this …
```

**(4) Constructors have no return value.**
If construction fails, you have no clean way to signal that to the caller. Workarounds (init functions, dummy objects) are messy and easily forgotten.

**(5) The caller may not be the right place to handle the error.**
The immediate caller may have no idea what to do with the error — but with return codes, they're forced to either handle it (poorly) or propagate it manually up several layers.

### 9.3 The Exception Solution

> Corresponds to LearnCpp 27.1 — "Exceptions"

Exception handling **decouples** error handling from normal control flow:

- A function that detects a problem **throws** an exception.
- The exception propagates up the call stack automatically until **someone** catches it.
- Code paths that don't care about errors are not cluttered with `if (error) return` checks.

The next sections show how this works mechanically.

---

## 10. Basic Exception Handling — throw, try, catch

> Corresponds to LearnCpp 27.2 (full chapter)

### 10.1 The Three Keywords

C++ exception handling is built on three keywords:

| Keyword | Role |
|---|---|
| `throw expr;` | Raise an exception. The value of `expr` is the exception object. |
| `try { … }` | Watch the enclosed code for thrown exceptions. |
| `catch (T x) { … }` | Handle exceptions of type `T` thrown by the matched `try` block. |

### 10.2 Throwing an Exception

Any value can be thrown:

```cpp
throw -1;                                          // int
throw ENUM_INVALID_INDEX;                          // enum
throw "Can not take square root of negative";      // const char*
throw dX;                                          // a double variable
throw MyException("Fatal Error");                  // a class object
```

The **value** is the exception. Signal-raising is also commonly called "**raising**" the exception.

### 10.3 The try Block

A `try` block is a region of code under observation:

```cpp
try {
    // statements that might throw
    throw -1;
}
```

The `try` block alone says nothing about *how* exceptions get handled — it just sets up the observation point. It **must** be followed by at least one `catch`.

### 10.4 The catch Block

```cpp
catch (int x) {
    std::cerr << "Caught int with value " << x << '\n';
}
```

Rules:

- A `try` must be followed immediately by one or more `catch` blocks.
- Each `catch` handles **one type**.
- Catch parameters behave like function parameters: you can omit the name if you don't use the value.

```cpp
catch (double) {              // no name needed
    std::cerr << "Caught a double\n";
}
```

> ⚠️ **Best Practice**
> **No implicit conversions are performed** when matching exceptions with `catch` blocks. An `int` exception will not match `catch(double)`. A `char` will not match `catch(int)`. **Exception**: a derived-class exception will match a `catch` for its base class (we revisit this in section 13).

### 10.5 Catch by Value vs. Reference

- **Fundamental types** (int, double, …): catch **by value** (cheap to copy).
- **Class types**: catch **by `const` reference** to avoid an unnecessary copy and to prevent **slicing**.

```cpp
catch (const std::string& msg) { … }       // class — by const reference
catch (int x)                  { … }       // fundamental — by value
```

### 10.6 A Complete Example

```cpp
#include <iostream>
#include <string>

int main()
{
    try
    {
        throw -1;
    }
    catch (double)              { std::cerr << "type double\n"; }
    catch (int x)               { std::cerr << "int with value: " << x << '\n'; }
    catch (const std::string&)  { std::cerr << "type std::string\n"; }

    std::cout << "Continuing on our merry way\n";
}
```

Output:

```
int with value: -1
Continuing on our merry way
```

### 10.7 How Matching Works

When `throw -1;` runs:

1. Execution stops at the throw.
2. The runtime finds the **nearest enclosing `try` block** that has matching `catch` handlers.
3. The handlers are examined **in order**. The **first matching** handler runs.
4. Once a handler finishes, execution continues at the first statement **after the last `catch`** of that group. **The remaining handlers are not run.**

### 10.8 Exceptions Are Handled Immediately

The example below shows that code after a `throw` does **not** run:

```cpp
try {
    throw 4.5;
    std::cout << "This never prints\n";    // skipped — throw transferred control out
}
catch (double x) {
    std::cerr << "We caught a double of value: " << x << '\n';
}
```

Output:

```
We caught a double of value: 4.5
```

### 10.9 A Realistic Example

```cpp
#include <cmath>
#include <iostream>

int main()
{
    std::cout << "Enter a number: ";
    double x{};
    std::cin >> x;

    try {
        if (x < 0.0)
            throw "Cannot take sqrt of negative number";
        std::cout << "The sqrt of " << x << " is " << std::sqrt(x) << '\n';
    }
    catch (const char* msg) {
        std::cerr << "Error: " << msg << '\n';
    }
}
```

For input `-4`:

```
Enter a number: -4
Error: Cannot take sqrt of negative number
```

### 10.10 What catch Blocks Typically Do

Four common patterns:

1. **Log the error** (to console or file) and let the function continue.
2. **Return an error code** back to the caller.
3. **Throw a different exception** — the new throw is *not* caught by the same `try`, but by the next enclosing one.
4. (In `main()`) **Catch fatal errors** and terminate the program cleanly.

### 10.11 Python Comparison

| | Python | C++ |
|---|---|---|
| Keywords | `raise`, `try`, `except` | `throw`, `try`, `catch` |
| Exception type | Object (typically derives from `BaseException`) | Any type (object, fundamental, even C-style string) |
| Multiple handlers | `except T1: … except T2: …` | `catch (T1) { … } catch (T2) { … }` |
| Catch all | `except:` or `except Exception:` | `catch (...)` (see section 12) |
| Type conversion | Subclass matches base via `isinstance` | Only derived→base; no fundamental promotions |
| `finally` clause | Yes | **No** — use RAII (destructors) instead |

C++ lacks `finally`, but the RAII pattern (resource cleanup in destructors of local objects) accomplishes the same goal more robustly — see section 13.

---

## 11. Exceptions, Functions, and Stack Unwinding

> Corresponds to LearnCpp 27.3 (full chapter)

### 11.1 Throws Don't Have to Be Inside a try

The killer feature of exceptions: a function can `throw` from anywhere, and the exception **propagates up the call stack** until it finds a matching `catch`.

```cpp
double mySqrt(double x)
{
    if (x < 0.0)
        throw "Cannot take sqrt of negative";   // no try block here!
    return std::sqrt(x);
}

int main()
{
    double x{};
    std::cin >> x;

    try {
        double d = mySqrt(x);            // throw propagates from mySqrt to here
        std::cout << "sqrt is " << d << '\n';
    }
    catch (const char* msg) {
        std::cerr << "Error: " << msg << '\n';
    }
}
```

> 💡 **Key Insight**
> Try blocks catch exceptions not only from statements within the try block, but also from functions that are called within the try block (directly or transitively).

This lets us write *modular* functions like `mySqrt` that detect problems but **delegate the policy decision** of what to do about them to their caller. A console app might print to `cerr`; a GUI app might pop up a dialog. The same `mySqrt` works in both.

### 11.2 Stack Unwinding — The Mechanism

When an exception is thrown:

1. Check whether the **current function** can handle it (i.e. the throw was inside a `try` that has a matching `catch`).
2. If not, check the **caller**: was the call to the current function inside a `try` block with a matching `catch`? If so, the caller handles it.
3. If not, check the caller's caller. Continue up the call stack.
4. If a handler is found, **unwind the stack** down to that point (destroying local variables of all functions in between) and run the handler.
5. If no handler is found, the program calls `std::terminate` (see section 12).

> 💡 **Key Insight**
> Unwinding the stack destroys local variables in the functions that are unwound, which means **their destructors execute**. This is why RAII works during exceptional control flow.

### 11.3 Worked Example — A 5-Function Chain

```cpp
#include <iostream>

void D() {
    std::cout << "Start D\n";
    std::cout << "D throwing int exception\n";
    throw -1;
    std::cout << "End D\n";                     // skipped
}

void C() {
    std::cout << "Start C\n";
    D();
    std::cout << "End C\n";                     // skipped — unwound
}

void B() {
    std::cout << "Start B\n";

    try { C(); }
    catch (double) {                            // type mismatch: int can't match double
        std::cerr << "B caught double\n";
    }

    try { }                                     // empty try block
    catch (int) {                               // would match int — but the throw was NOT inside this try
        std::cerr << "B caught int\n";
    }

    std::cout << "End B\n";                     // skipped — unwound
}

void A() {
    std::cout << "Start A\n";

    try { B(); }
    catch (int)    { std::cerr << "A caught int exception\n"; }      // MATCH!
    catch (double) { std::cerr << "A caught double exception\n"; }   // not reached

    std::cout << "End A\n";
}

int main() {
    std::cout << "Start main\n";

    try { A(); }
    catch (int) { std::cerr << "main caught int exception\n"; }   // not reached — A handled it

    std::cout << "End main\n";
}
```

Output:

```
Start main
Start A
Start B
Start C
Start D
D throwing int exception
A caught int exception
End A
End main
```

### 11.4 Lessons from the Example

- **C didn't have to handle it.** C had no `try` at all; the exception passed through it cleanly.
- **B had two `try` blocks but neither caught the exception.** The first had a `catch(double)` — type mismatch. The second had a `catch(int)` — would match, but **the call to C was not inside that `try`**, so the throw bypassed it. Either way, B is unwound.
- **A handled it.** A's call to B is inside a `try` with a matching `catch(int)`, so A catches it.
- **After A's catch, control continues normally.** `"End A"` is printed; A returns to `main` without ever re-throwing.
- **main has its own `catch(int)`** — but it's never reached, because the exception was already handled by the time control got back to `main`.

### 11.5 Four Principles

1. The immediate caller of a throwing function doesn't have to handle the exception. (C didn't.)
2. If a `try` lacks a matching `catch`, **unwinding proceeds as if there were no `try`**.
3. A function can have a matching `catch` *and still not catch the exception* if the throw didn't originate from inside the associated `try`.
4. Once a matching `catch` runs, control proceeds normally from the first statement after the entire `catch` group.

---

## 12. Uncaught Exceptions and Catch-All Handlers

> Corresponds to LearnCpp 27.4 (full chapter)

### 12.1 What Happens If Nobody Catches It

Modify the sqrt example so `main` has no `try`:

```cpp
int main() {
    double x{};
    std::cin >> x;
    std::cout << "sqrt is " << mySqrt(x) << '\n';  // no try!
}
```

If `mySqrt(-4)` throws, the runtime walks all the way up the stack and finds no handler. Result: **`std::terminate()` is called and the program is aborted**.

> ⚠️ **Warning**
> If no handler is found for a thrown exception, `std::terminate()` is called. The call stack **may or may not be unwound** in this case. If unwinding is skipped, local variables are **not destroyed**, and any cleanup their destructors were supposed to do **will not happen**.

> 🧪 **As an aside…**
> Why might the stack not unwind? Because preserving the unwound stack lets debuggers show you exactly where the unhandled exception originated. If the stack were already cleaned up, you'd lose all that diagnostic information.

### 12.2 The catch-all Handler

> Corresponds to LearnCpp 27.4 — "Catch-all handlers"

To catch **any** type of exception, use the **ellipsis catch handler**:

```cpp
try {
    throw 5;                  // an int
}
catch (double x) {
    std::cout << "Caught double: " << x << '\n';
}
catch (...) {                 // catch-all
    std::cout << "Caught an exception of an undetermined type\n";
}
```

Rules:

- `catch(...)` must be the **last** handler — otherwise more specific handlers below it would never run.
- The catch-all has no way to access the exception value (since it doesn't know the type).
- A bare `catch(...) { }` is sometimes used to **swallow** all exceptions silently — useful for ensuring stack unwinding happens before program exit.

### 12.3 Wrapping main with catch-all

A common pattern is to wrap the body of `main` in a `try` + `catch(...)` so that any unhandled exception leads to **orderly termination** instead of an abrupt abort:

```cpp
int main()
{
    GameSession session{};

    try {
        runGame(session);
    }
    catch (...) {
        std::cerr << "Abnormal termination\n";
    }

    saveGame(session);          // give the user a chance to save state
}
```

> 🛠️ **Tip**
> If your program uses exceptions, consider using a catch-all handler in `main()` to ensure orderly behavior if an unhandled exception escapes.
> If you do reach the catch-all, assume the program is in some indeterminate state, do cleanup immediately, and terminate.

### 12.4 Debugging Unhandled Exceptions

Catch-alls can hide useful debug information. Most debuggers break on uncaught exceptions and show the stack at the throw point — but if a `catch(...)` is present, the exception isn't technically "uncaught," and the debugger won't break.

The standard workaround: **conditionally compile** the catch-all out in debug builds.

```cpp
class DummyException {            // can never be instantiated
    DummyException() = delete;
};

int main() {
    GameSession session {};

    try {
        runGame(session);
    }
#ifndef NDEBUG                     // RELEASE: catch all
    catch (...) {
        std::cerr << "Abnormal termination\n";
    }
#else                              // DEBUG: a catch that can never fire
    catch (DummyException) { }
#endif

    saveGame(session);
}
```

Because every `try` requires at least one `catch`, we need *some* catch in debug mode. `DummyException` can't be constructed (its default constructor is deleted), so the handler is syntactically valid but unreachable — any thrown exception will fall through and trigger the debugger.

---

## 13. Exception Classes and Inheritance

> Corresponds to LearnCpp 27.5 (full chapter)

### 13.1 Exceptions in Member Functions

Operators like `operator[]` have a fixed signature — no way to return an error code without breaking the operator contract. Throwing an exception works perfectly:

```cpp
int& IntArray::operator[](int index)
{
    if (index < 0 || index >= getLength())
        throw index;                  // signal an error
    return m_data[index];
}
```

The function signature is unchanged; the caller can wrap the call in `try`/`catch`.

### 13.2 When Constructors Fail

> Corresponds to LearnCpp 27.5 — "When constructors fail"

Constructors have no return value, so reporting failure is awkward — **except** with exceptions. Throwing from a constructor cleanly aborts object creation.

**Important rule:**

> When a constructor throws, the object's class members are **already constructed** at the time of the throw, so **their destructors run**. But **the class's own destructor does NOT run**, because the object never finished construction.

```cpp
#include <iostream>

class Member {
public:
    Member()  { std::cerr << "Member allocated some resources\n"; }
    ~Member() { std::cerr << "Member cleaned up\n"; }
};

class A {
private:
    int    m_x{};
    Member m_member;
public:
    A(int x) : m_x{x} {
        if (x <= 0)
            throw 1;                  // throw before A is fully constructed
    }
    ~A() { std::cerr << "~A\n"; }     // NEVER called when constructor throws
};

int main() {
    try { A a { 0 }; }
    catch (int) { std::cerr << "Oops\n"; }
}
```

Output:

```
Member allocated some resources
Member cleaned up
Oops
```

`m_member` is constructed; then `A`'s body executes and throws. The compiler then automatically destroys `m_member` (running `~Member`). `~A` is **not** called.

### 13.3 RAII to the Rescue

The trick to safely allocating resources in constructors: **make every resource a member of a RAII class**. Then if the constructor throws, the resource members' destructors do the cleanup automatically.

```cpp
class Foo {
private:
    int* ptr;                                // Foo must clean up
};

class Foo {
private:
    std::unique_ptr<int> ptr;                // unique_ptr cleans up itself
};
```

If `Foo`'s constructor throws **after** the raw `int*` version allocated memory, `Foo` is now responsible for tracking that and freeing the memory — error-prone and easy to forget. With `std::unique_ptr`, the smart pointer's destructor runs automatically and frees the memory regardless of how the constructor exits.

> 💡 **Key Insight**
> RAII makes exception-safe code easy to write. Resource ownership lives in member objects with proper destructors, so cleanup happens whether the constructor succeeds or throws.

### 13.4 Why Plain Types Are Bad Exceptions

```cpp
try {
    int* value = new int{ array[index1] + array[index2] };
}
catch (int value) {
    // What are we catching here?
    //   - operator[] out-of-range index?
    //   - operator+ overflow?
    //   - new failed?
    // No way to tell!
}
```

Throwing an `int` (or a `const char*`) gives the caller no way to distinguish *what kind* of problem occurred.

### 13.5 Exception Classes

The solution is to define a class specifically for being thrown:

```cpp
#include <string>
#include <string_view>

class ArrayException
{
private:
    std::string m_error;

public:
    ArrayException(std::string_view error) : m_error{error} {}
    const std::string& getError() const { return m_error; }
};
```

Full program:

```cpp
class IntArray {
    int m_data[3] {};
public:
    int getLength() const { return 3; }
    int& operator[](int index) {
        if (index < 0 || index >= getLength())
            throw ArrayException{ "Invalid index" };
        return m_data[index];
    }
};

int main() {
    IntArray array;
    try {
        int value { array[5] };
    }
    catch (const ArrayException& exception) {              // by const ref!
        std::cerr << "Array exception (" << exception.getError() << ")\n";
    }
}
```

> ⚠️ **Best Practice**
> - Catch exceptions of **fundamental types** by **value** (they're cheap to copy).
> - Catch exceptions of **class types** by **`const` reference** — this avoids both an unnecessary copy and **object slicing** when working with derived exception classes (see next section).

### 13.6 Exceptions and Inheritance

A derived-class exception **will match** a handler for its base class:

```cpp
class Base    { };
class Derived : public Base { };

int main() {
    try { throw Derived{}; }
    catch (const Base&)    { std::cerr << "caught Base\n"; }      // matches Derived!
    catch (const Derived&) { std::cerr << "caught Derived\n"; }   // never reached
}
```

Output: `caught Base`

The runtime checks `catch` handlers **sequentially**. Since `Derived` is-a `Base`, the first handler matches and the `Derived`-specific one never gets a chance.

**Fix:** put the more derived handler first:

```cpp
catch (const Derived&) { std::cerr << "caught Derived\n"; }
catch (const Base&)    { std::cerr << "caught Base\n"; }
```

Now `Derived` exceptions match the first handler; `Base` exceptions fall through to the second.

> 📜 **Rule**
> Handlers for derived exception classes should be listed before those for base classes.

### 13.7 std::exception — The Standard Hierarchy

> Corresponds to LearnCpp 27.5 — "std::exception"

The standard library throws many exception classes:

- `std::bad_alloc` — from `new` on memory exhaustion
- `std::bad_cast` — from a failed `dynamic_cast` to a reference
- `std::length_error` — from constructing a too-large `std::string`
- `std::out_of_range` — from `std::vector::at()` on a bad index
- … and many more

**All of them derive from `std::exception`** (defined in `<exception>`). This means you can catch the entire hierarchy with one handler:

```cpp
#include <exception>
#include <iostream>
#include <string>
#include <limits>

int main()
{
    try {
        std::string s;
        s.resize(std::numeric_limits<std::size_t>::max());   // triggers std::length_error
    }
    catch (const std::exception& e) {
        std::cerr << "Standard exception: " << e.what() << '\n';
    }
}
```

Output (typical):

```
Standard exception: string too long
```

> 💡 **Key Insight**
> `std::exception` has a `virtual const char* what() const noexcept;` member that returns a description of the exception. Most derived classes override `what()` to provide a more specific message.
>
> The string returned by `what()` is for **descriptive display only**. Do not use it for programmatic comparisons — it's not guaranteed to be the same across compilers or library versions.

You can mix specific and general handlers:

```cpp
try { /* … */ }
catch (const std::length_error& e) {                  // specific (and any derived)
    std::cerr << "Out of memory!\n";
}
catch (const std::exception& e) {                     // everything else from std
    std::cerr << "Standard exception: " << e.what() << '\n';
}
```

### 13.8 Using Standard Exceptions Directly

Nothing throws `std::exception` directly, and neither should you — it's an interface base class. But you can freely throw other standard exception classes if they fit your need.

`std::runtime_error` (in `<stdexcept>`) is a popular choice because its constructor accepts a custom message:

```cpp
#include <stdexcept>

throw std::runtime_error("Bad things happened");
```

Catching it:

```cpp
catch (const std::exception& e) {
    std::cerr << "Standard exception: " << e.what() << '\n';
    // "Standard exception: Bad things happened"
}
```

### 13.9 Rolling Your Own — Deriving from std::exception

```cpp
class ArrayException : public std::exception
{
    std::string m_error;
public:
    ArrayException(std::string_view err) : m_error{err} {}

    // override what() — return type must be const char*, and noexcept must match
    const char* what() const noexcept override { return m_error.c_str(); }
};
```

> ⚠️ **Best Practice**
> When overriding `std::exception::what()`, the override **must also be `noexcept`** because the base function is declared `noexcept`. Forgetting the `noexcept` specifier is a compile error.

Or derive from `std::runtime_error` to inherit message handling for free:

```cpp
class ArrayException : public std::runtime_error
{
public:
    ArrayException(const std::string& err) : std::runtime_error{err} {}
    // no need to override what() — std::runtime_error::what() already works
};
```

### 13.10 The Lifetime of Exception Objects

> Corresponds to LearnCpp 27.5 — "The lifetime of exceptions"

The exception object is typically a temporary or a local variable. But stack unwinding destroys local variables — so how does the exception object survive?

**Answer:** when you `throw`, the compiler **copies** (or sometimes moves) the exception object to a special area of memory outside the call stack reserved for exception handling. That copy persists until the exception is handled.

Consequence: **exception objects must be copyable**.

```cpp
class Derived : public Base {
public:
    Derived(const Derived&) = delete;    // not copyable
};

throw Derived{};                          // compile error
```

> 🛠️ **Tip**
> Exception objects need to be copyable. Smart compilers may move or elide the copy in specific cases, but the type must support copying in principle.

**Another important rule:** exception objects should **not** hold pointers or references to stack-allocated variables, because those variables may be destroyed during the stack unwinding triggered by your throw. The result is a dangling pointer or reference inside an exception object — undefined behavior on access.

---

## 14. Exception Specifications and noexcept

> Corresponds to LearnCpp 27.9 (full chapter)

### 14.1 Why It Matters

Looking at a declaration:

```cpp
int doSomething();
```

…you can't tell whether this function might throw. The comment-based answer is unreliable (comments rot, compilers don't enforce them). C++ gives us **`noexcept`** as a compiler-checked annotation.

### 14.2 The noexcept Specifier

Every C++ function is either:

- **Non-throwing** — promises not to expose any thrown exception to the caller, or
- **Potentially throwing** — may expose exceptions.

To declare a function non-throwing, write `noexcept` after the parameter list:

```cpp
void doSomething() noexcept;     // non-throwing
```

**Important nuance:** `noexcept` does **not** prevent the function from throwing internally or calling other potentially throwing functions. What it forbids is **letting an exception escape**. As long as the function catches any internal exceptions before they leave, it's fine.

If an unhandled exception **does** try to exit a `noexcept` function, **`std::terminate()` is called**, regardless of any matching handler further up the stack.

> 💡 **Key Insight**
> The promise that a `noexcept` function makes is **contractual**, not compiler-enforced for the body. The compiler will not stop you from writing a noexcept function that calls throwing code. If an exception escapes, your program **dies**.
>
> So: it's safest to ensure a noexcept function doesn't do *anything* that could possibly throw. The function can't have an exception bug if no exception can be raised at all.

### 14.3 Walkthrough — noexcept Behavior

This program illustrates two scenarios:

```cpp
#include <iostream>

class Doomed { public: ~Doomed() { std::cout << "Doomed destructed\n"; } };

void thrower() {
    std::cout << "Throwing exception\n";
    throw 1;
}

void pt() {                              // potentially throwing
    std::cout << "pt called\n";
    Doomed doomed{};                     // would be destroyed if stack unwinds
    thrower();
    std::cout << "this never prints\n";
}

void nt() noexcept {                     // non-throwing
    std::cout << "nt called\n";
    Doomed doomed{};
    thrower();
    std::cout << "this never prints\n";
}

void tester(int c) noexcept {            // also noexcept!
    std::cout << "tester case " << c << " called\n";
    try {
        (c == 1) ? pt() : nt();
    }
    catch (...) {
        std::cout << "tester caught exception\n";
    }
}

int main() {
    tester(1);
    std::cout << "Test successful\n\n";
    tester(2);
    std::cout << "Test successful\n";
}
```

Output:

```
tester case 1 called
pt called
Throwing exception
Doomed destructed
tester caught exception
Test successful

tester case 2 called
nt called
Throwing exception
terminate called after throwing an instance of 'int'
```

**Case 1** (`pt`, potentially throwing):

- `pt` calls `thrower` which throws.
- The first handler is in `tester`, which is `noexcept`. But that's OK — the exception is **caught inside** `tester`, so it never escapes. `noexcept` is honored.
- Stack unwinds from `thrower` through `pt` back to `tester`, destroying `doomed` along the way. ✅

**Case 2** (`nt`, noexcept):

- `nt` calls `thrower` which throws.
- To reach `tester`'s handler, the exception must pass through `nt`. But `nt` is `noexcept`!
- This is a **violation of `nt`'s contract**, so `std::terminate()` is called immediately.
- On the author's machine, the stack was **not** unwound — `doomed`'s destructor never ran. ⚠️

### 14.4 noexcept(condition)

`noexcept` accepts an optional Boolean parameter:

```cpp
void f() noexcept(true);    // non-throwing (same as `noexcept`)
void g() noexcept(false);   // potentially throwing
```

`noexcept(false)` is rarely useful in normal code — but in **template** code it lets you write a function whose throw-ness depends on its template parameters:

```cpp
template <typename T>
void wrap(T t) noexcept(noexcept(t()))   // noexcept iff t() is noexcept
{
    t();
}
```

### 14.5 Which Functions Are Non-Throwing by Default?

**Implicitly non-throwing:**

- Destructors

**Non-throwing by default if implicitly declared or `= default`d:**

- Default constructor, copy constructor, move constructor
- Copy assignment, move assignment
- Comparison operators (C++20)

> ⚠️ Caveat: if any of these functions calls a potentially throwing function (e.g. because a data member's constructor is potentially throwing), they become potentially throwing.

**Potentially throwing by default if user-defined:**

- Normal functions
- User-defined constructors
- User-defined operators

### 14.6 The noexcept Operator

`noexcept(expr)` (used as an operator) returns a `bool`: `true` if the compiler thinks `expr` cannot throw, `false` otherwise. The expression is **not evaluated** — it's a compile-time check.

```cpp
void foo()          { throw -1; }
void boo()          { }
void goo() noexcept { }
struct S { };

constexpr bool b1 = noexcept(5 + 3);    // true  — ints don't throw
constexpr bool b2 = noexcept(foo());    // false — foo() is not noexcept (even though declared without noexcept(false) it's the default)
constexpr bool b3 = noexcept(boo());    // false — boo() is potentially throwing by default
constexpr bool b4 = noexcept(goo());    // true  — goo() is noexcept
constexpr bool b5 = noexcept(S{});      // true  — default constructor is implicitly noexcept
```

### 14.7 Exception Safety Guarantees

> Corresponds to LearnCpp 27.9 — "Exception safety guarantees"

There are **four contractually meaningful** levels of safety guarantee a function can offer:

| Level | Meaning |
|---|---|
| **No guarantee** | If an exception is thrown, anything could happen — the object may be left unusable, memory may leak. |
| **Basic guarantee** | If an exception is thrown, no leaks, and the object is still usable, but its state may have been modified. |
| **Strong guarantee** | If an exception is thrown, no leaks, **and** the program state is unchanged. The operation either succeeds completely or has no observable effect (transactional). |
| **No-throw / No-fail** | The function either always succeeds (no-fail) or never lets an exception escape (no-throw). `noexcept` corresponds to this level. |

**No-throw** is required for:

- **Destructors** (and anything destructors call) — because they run during stack unwinding, and a throw during unwinding kills the program.

**No-fail** is required for:

- **Move constructors** and **move assignment operators** (so the standard library can use moves safely in noexcept-aware containers)
- **Swap** functions
- **Container clear/erase/reset**
- Operations on `std::unique_ptr`

### 14.8 When to Use noexcept

**Reasons to mark a function `noexcept`:**

1. Allows safe calling from destructors and other no-throw contexts.
2. Permits compiler optimizations (no need to keep the stack unwindable).
3. Some standard library containers (`std::vector` in particular) check `noexcept` via `std::move_if_noexcept` to decide whether to use the fast move path or the slower copy path. See LearnCpp 27.10.

The **standard library's policy**: mark `noexcept` only on functions that genuinely **must not** throw. Functions that *happen* to not throw in practice are usually left unmarked.

> ⚠️ **Best Practice — Always `noexcept`:**
> - **Move constructors**
> - **Move assignment operators**
> - **Swap functions**

> ⚠️ **Best Practice — Mark `noexcept` when you can:**
> - Copy constructors and copy assignment operators (if no-throw)
> - Destructors (typically already implicitly noexcept)

> ⚠️ **Best Practice — When in doubt:**
> **Err on the side of NOT using `noexcept`.** Removing a `noexcept` annotation later is a breaking change for users who relied on the no-throw guarantee. *Adding* `noexcept` later is always safe.

### 14.9 Dynamic Exception Specifications (Deprecated)

> Optional reading

Before C++11 and until C++17, there was a different syntax — the **dynamic exception specification**:

```cpp
int doSomething() throw();                          // does not throw
int doSomething() throw(std::out_of_range, int*);   // may throw these specific types
int doSomething() throw(...);                       // may throw anything
```

This was **deprecated in C++11 and removed in C++17/C++20** because it had implementation gaps, didn't play well with templates, and led to common misunderstandings. **`noexcept` replaces all of this.**

If you see `throw()` in old code, that's an obsolete way of writing `noexcept`.

---

## 15. Friend Non-Member Functions

> Corresponds to LearnCpp 15.8 (full chapter)

### 15.1 Why Friendship Exists

So far, the rules of access control have been black-and-white:

- Private members: visible only to other members of the class.
- Public members: visible to everyone.

But real designs sometimes need a *middle ground*:

- A separate **display class** that needs to read a storage class's private fields, but you don't want to expose those fields to the rest of the world.
- A **non-member function** that ought, syntactically, to behave like a class member (typical when overloading binary operators where you want symmetric argument handling).

Public accessors are one option but they expose implementation details. **Friendship** offers a targeted alternative.

### 15.2 The friend Mechanism

Inside a class body, a `friend` declaration tells the compiler "this other class or function has full access to my private and protected members." A **friend** can be:

- A non-member function (this section)
- A class
- A member function of another class (next chapter in LearnCpp, not in this week's reading)

> 💡 **Key Insight**
> Friendship is **granted by the class** whose members will be accessed — not requested by the outside party. The class always retains control over who gets access. Between access controls and friend declarations, encapsulation is preserved at the design level.

Where you place the `friend` declaration inside the class body doesn't matter — it isn't affected by `public:` / `private:` labels.

### 15.3 Friend Non-Member Functions — Basic Example

```cpp
#include <iostream>

class Accumulator
{
private:
    int m_value { 0 };

public:
    void add(int value) { m_value += value; }

    // Grant friendship to the non-member function print(const Accumulator&)
    friend void print(const Accumulator& accumulator);
};

void print(const Accumulator& accumulator)
{
    // Because print is a friend, it can touch m_value directly
    std::cout << accumulator.m_value;
}

int main() {
    Accumulator acc{};
    acc.add(5);
    print(acc);                              // 5
}
```

Notes:

- `print` is **not** a member function. It has no `this`. The `Accumulator` to operate on must be passed explicitly.
- The `friend` declaration is just a **promise** that this function (when defined later) will have access. It doesn't itself define `print`.

### 15.4 Defining a Friend Inside the Class Body

You can write the friend's definition inside the class body too:

```cpp
class Accumulator
{
private:
    int m_value { 0 };

public:
    void add(int value) { m_value += value; }

    // Friend defined right here — still a NON-MEMBER function
    friend void print(const Accumulator& accumulator)
    {
        std::cout << accumulator.m_value;
    }
};
```

> ⚠️ **Common pitfall**
> Even though `print` is written inside the class braces, it is **not** a member of `Accumulator`. It's still a non-member function — the only difference is that the compiler treats it as if it had been defined just outside the class.

### 15.5 Symmetry: Why Sometimes a Non-Member is Better

Compare a member equality check with a non-member one:

```cpp
class Value {
    int m_value{};
public:
    explicit Value(int v) : m_value{v} { }

    bool isEqualToMember(const Value& v) const;
    friend bool isEqualToNonmember(const Value& v1, const Value& v2);
};

bool Value::isEqualToMember(const Value& v) const {
    return m_value == v.m_value;             // one implicit (this), one explicit (v)
}

bool isEqualToNonmember(const Value& v1, const Value& v2) {
    return v1.m_value == v2.m_value;         // both explicit — symmetric
}
```

The non-member version reads more naturally because both operands are treated identically. This pattern becomes especially valuable when overloading binary operators like `operator+` or `operator==`, where you don't want one operand to be "special."

### 15.6 Multiple Friendships and Forward Declarations

A function can be a friend of multiple classes at once. When two classes need to befriend the same function, you need a **forward declaration**:

```cpp
#include <iostream>

class Humidity;            // forward declaration so Temperature can mention it

class Temperature {
    int m_temp { 0 };
public:
    explicit Temperature(int t) : m_temp{t} { }
    friend void printWeather(const Temperature& temp, const Humidity& humidity);
};

class Humidity {
    int m_humidity { 0 };
public:
    explicit Humidity(int h) : m_humidity{h} { }
    friend void printWeather(const Temperature& temp, const Humidity& humidity);
};

void printWeather(const Temperature& temp, const Humidity& humidity) {
    std::cout << "Temperature: " << temp.m_temp
              << ", Humidity: " << humidity.m_humidity << '\n';
}
```

Why is `printWeather` better as a non-member?

- It uses **both** classes equally — making it a member of either would create artificial asymmetry.
- As a friend of both, it has access to the private data of both.

**Forward declaration syntax** is just `class Humidity;` — no return types, no parameters, just the name. (Templates require slightly more: `template <typename T> class Foo;`.) Forward declarations work the same way as function forward declarations: they tell the compiler "this identifier exists, full details are coming later."

### 15.7 Does Friendship Violate Encapsulation?

The standard objection: "If a friend can see private members, isn't encapsulation broken?"

LearnCpp's answer: **No, because the class itself granted the access.** A friend is best thought of as an **extension** of the class — code that has the same access rights and is logically part of the same module, even though it's not syntactically inside the class body.

That said, friendship does create **coupling**: if you change the class's implementation, all its friends may need to be updated too. To mitigate this:

> ⚠️ **Best Practice**
> A friend function should prefer to use the class's public interface over direct access whenever possible. This insulates the friend from future implementation changes.

### 15.8 Prefer Non-Friend over Friend

Following the broader principle that non-member functions are usually better than members for utility operations:

> ⚠️ **Best Practice**
> Prefer to implement a function as a **non-friend** when possible and reasonable.

Compare:

```cpp
// VERSION 1 — friend, directly accesses m_value
class Accumulator {
    int m_value { 0 };
public:
    void add(int v) { m_value += v; }
    friend void print(const Accumulator& a);
};
void print(const Accumulator& a) { std::cout << a.m_value; }

// VERSION 2 — non-friend, uses public accessor
class Accumulator {
    int m_value { 0 };
public:
    void add(int v) { m_value += v; }
    int  value() const { return m_value; }    // reasonable public accessor
};
void print(const Accumulator& a) { std::cout << a.value(); }
```

In version 2, if you later rename `m_value` to `m_total`, only `Accumulator` itself needs to change — `print` is insulated.

Be careful, though: each new public accessor adds **clutter** to the class's interface. For small classes (like `Accumulator`), an accessor is fine. For larger, more complex classes, using friendship can be a cleaner choice than ten one-line accessors.

### 15.9 Python Comparison

| | Python | C++ |
|---|---|---|
| Encapsulation enforcement | Convention only (`_name`, `__name`) | Compiler-enforced (`private`, `protected`) |
| "Friend" mechanism | Not needed — anyone can poke at `obj._private` | Explicit `friend` declaration |
| Common pattern | Just access the "private" attribute directly | Either provide a public accessor or grant friendship |

Python's "we're all consenting adults" philosophy makes friendship redundant; C++'s strict enforcement makes friendship necessary when you want to selectively bypass it.

---

## 16. Stream Classes for Strings (stringstream)

> Corresponds to LearnCpp 28.4 (full chapter)

### 16.1 What stringstreams Are

`std::stringstream` and its relatives are stream objects that use a `std::string` as a **buffer** instead of a file or the console. You can:

- Insert (`<<`) values into the buffer.
- Extract (`>>`) values out of the buffer.
- Use them anywhere a stream is expected.

They're commonly used for:

- **Buffering** output for later display.
- **Converting** between strings and other types (numbers, custom classes, etc.).
- **Parsing** input line-by-line, then tokenizing within the line.

### 16.2 The Six Stream Classes

Include `<sstream>` to use any of these.

| Class | Inherits from | Used for |
|---|---|---|
| `istringstream` | `istream` | Reading from a string (extraction only) |
| `ostringstream` | `ostream` | Writing into a string (insertion only) |
| `stringstream`  | `iostream` | Both directions |
| `wistringstream`, `wostringstream`, `wstringstream` | wide-char versions | The same but for `wchar_t` strings |

### 16.3 Putting Data In

**Method 1 — insertion operator:**

```cpp
std::stringstream os;
os << "en garde!\n";        // appends to the buffer
```

**Method 2 — `str(string)` member function:**

```cpp
std::stringstream os;
os.str("en garde!");        // replaces the entire buffer
```

`<<` *appends*; `str(s)` *replaces*.

### 16.4 Getting Data Out

**Method 1 — `str()` returns the whole buffer:**

```cpp
std::stringstream os;
os << "12345 67.89\n";
std::cout << os.str();      // prints: 12345 67.89
```

**Method 2 — extraction operator `>>` reads one value at a time:**

```cpp
std::stringstream os;
os << "12345 67.89";

std::string a, b;
os >> a;                    // a = "12345"
os >> b;                    // b = "67.89"
std::cout << a << " - " << b << '\n';   // 12345 - 67.89
```

> 💡 **Key Insight**
> `>>` and `str()` operate at **different levels**:
> - Each `>>` reads the **next token** from the stream's read pointer. Successive `>>`s advance through the buffer.
> - `str()` returns the **entire buffer**, regardless of how many `>>`s have been done.

### 16.5 Converting Between Strings and Numbers

This is one of the most common idioms in C++. The insertion/extraction operators already know how to format every fundamental type, so a stringstream becomes a universal converter.

**Numbers → string:**

```cpp
std::stringstream os;
constexpr int    n = 12345;
constexpr double d = 67.89;
os << n << ' ' << d;

std::string s1, s2;
os >> s1 >> s2;
std::cout << s1 << ' ' << s2 << '\n';     // 12345 67.89
```

(In real code you'd typically just do `os.str()` to get `"12345 67.89"` as a single string.)

**Numerical string → numbers:**

```cpp
std::stringstream os;
os << "12345 67.89";

int    n {};
double d {};
os >> n >> d;
std::cout << n << ' ' << d << '\n';       // 12345 67.89
```

The extraction operator automatically converts the textual representation to the target type.

> ⚠️ **Tip**
> The modern alternatives `std::to_string(x)` (number → string) and `std::stoi(s)` / `std::stod(s)` (string → number) are simpler for one-shot conversions. Stringstreams shine when you need **multiple** conversions in sequence or when you want stream-formatting features (precision, hex, etc.).

### 16.6 Clearing a stringstream for Reuse

Two related but distinct things may need clearing:

- The **buffer** itself (the contents).
- The **error flags** (e.g. `eofbit`, `failbit` set by a previous failed extraction).

**Clear the buffer using `str("")`:**

```cpp
std::stringstream os;
os << "Hello ";
os.str("");                  // erase the buffer
os << "World!";
std::cout << os.str();       // prints: World!
```

A `std::string{}` works equally well:

```cpp
os.str(std::string{});       // same effect
```

**Clear the error flags using `clear()`:**

```cpp
os.clear();                  // reset stream state to "good"
```

> ⚠️ **Best Practice**
> When reusing a stringstream, call **both** `str("")` (to clear the buffer) **and** `clear()` (to reset error flags). If you only clear one, you may get surprising behavior — e.g. extraction silently doing nothing because `failbit` is still set.

```cpp
std::stringstream os;
os << "Hello ";
os.str("");                  // clear contents
os.clear();                  // clear flags
os << "World!";              // safe to reuse
std::cout << os.str();
```

### 16.7 Python Comparison

| | Python | C++ |
|---|---|---|
| String "stream" type | `io.StringIO` | `std::stringstream` |
| Number → string | `str(x)` or `f"{x}"` | `std::to_string(x)` or `ss << x; ss.str()` |
| String → int | `int(s)` | `std::stoi(s)` or `ss >> n` |
| String → float | `float(s)` | `std::stod(s)` or `ss >> d` |
| Multi-value parsing | `s.split()` then iterate | `ss >> a >> b >> c` |

```python
# Python
import io
ss = io.StringIO()
ss.write("hello ")
ss.write("world")
print(ss.getvalue())          # "hello world"

# Parsing tokens
parts = "12345 67.89".split()
n = int(parts[0])
d = float(parts[1])
```

```cpp
// C++
std::stringstream ss;
ss << "hello " << "world";
std::cout << ss.str();        // "hello world"

// Parsing tokens
std::stringstream parser{"12345 67.89"};
int    n;
double d;
parser >> n >> d;
```

---

## 17. Carried-Over Topic from Topic 6 PPT: Multiple Inheritance, Virtual Base Classes, and the Rule of Zero

> Corresponds to PPT *Topic 6: Inheritance & Polymorphism*, slides 27, 29–31, and 33
>
> ⚠️ **Note on scope**: this topic is **not** in the Week 7 LearnCpp reading list. It was flagged in the Week 6 notes as "may belong to Week 7" because it appears at the end of the Topic 6 PPT (which spans both Week 6 and Week 7 lectures). Following the user's "if unsure, include it" guidance, it is repeated and expanded here. If your Week 7 lecture skips it, you can safely skim this section.

### 17.1 public, private, and protected Inheritance (PPT page 27)

So far we've only used `public` inheritance, which models the "is-a" relationship. C++ also allows `private` and `protected` inheritance, but they mean something quite different.

| Inheritance kind | Public members of Base become … | Protected members of Base become … | Models |
|---|---|---|---|
| `public` | `public` in Derived | `protected` in Derived | **is-a** relationship (subtype) |
| `protected` | `protected` in Derived | `protected` in Derived | implementation reuse with access for further derivation |
| `private` | `private` in Derived | `private` in Derived | implementation reuse (no kind-of relationship) |

**Klefstad's rules of thumb:**

- Use `public` inheritance when Derived **is a kind of** Base.
- Use `private` inheritance when Derived just wants to **reuse** Base's implementation, but is not conceptually a Base.

> ⚠️ **Klefstad note**: Using `public` inheritance for pure implementation reuse is a misuse — it falsely implies that all Base operations make sense on Derived. (E.g. inheriting `Stack` from `Vector` publicly would let users do `stack[5]`, which violates stack semantics.)

In all three forms of inheritance, the derived class can still access the **protected** members of the base.

### 17.2 Multiple Inheritance — The Basics

C++ permits a class to inherit from **more than one** base class simultaneously:

```cpp
class Foo : public Base1, public Base2 { /* ... */ };
```

A `Foo` object now contains a `Base1` part and a `Base2` part. It can be used wherever a `Base1` reference or pointer is expected, and wherever a `Base2` reference or pointer is expected.

> 💡 **Compared to Java/C#**: Java and C# don't allow plain multiple inheritance of *classes* — only multiple inheritance of *interfaces*. This was a deliberate simplification to avoid the headaches C++ multiple inheritance introduces.

### 17.3 The Ambiguity Problem (PPT page 31)

When two base classes have a member with the same name, the derived class inherits **both copies**, and the compiler can't tell which one you mean:

```cpp
struct Base1 { int foo(); /* ... */ };
struct Base2 { int foo(); /* ... */ };
struct Derived : Base1, Base2 { /* ... */ };

int main() {
    Derived d;
    d.foo();        // ERROR: ambiguous — which foo()?
}
```

**Fix 1 — qualify with the scope operator:**

```cpp
d.Base1::foo();         // explicitly want Base1's version
```

**Fix 2 — define `foo` in Derived to override or combine:**

```cpp
struct Derived : Base1, Base2 {
    int foo() { Base1::foo(); Base2::foo(); return 0; }
};
```

### 17.4 The Diamond Problem (PPT pages 29–30)

Suppose `Base` is inherited by both `Mid1` and `Mid2`, and a class `Bottom` inherits from both `Mid1` and `Mid2`:

```
        Base
       /    \
    Mid1    Mid2
       \    /
       Bottom
```

This is the **diamond inheritance pattern**. Two problems:

1. **Storage duplication** — `Bottom` contains **two** copies of `Base`'s members (one via `Mid1`, one via `Mid2`).
2. **Ambiguity** — references to `Base` data members are ambiguous: which copy do you mean?

```cpp
class Vector { /* ... */ };
class CheckedVector : public Vector { /* ... */ };       // standard inheritance
class InitVector    : public Vector { /* ... */ };       // standard inheritance
class InitCheckedVector : public CheckedVector, public InitVector { /* ... */ };
// !! InitCheckedVector contains TWO Vector subobjects: one via CheckedVector, one via InitVector
```

### 17.5 Virtual Base Classes — The Solution

> Corresponds to PPT pages 29–30

Adding the `virtual` keyword to the inheritance declaration tells the compiler: "even if this base class appears multiple times in the inheritance hierarchy, **only ever include it once** in the final object."

```cpp
class Vector { /* ... */ };
class CheckedVector : public virtual Vector { /* ... */ };
class InitVector    : public virtual Vector { /* ... */ };
class InitCheckedVector : public CheckedVector, public InitVector { /* ... */ };
// Now InitCheckedVector contains exactly ONE Vector subobject, shared between CheckedVector and InitVector.
```

> ⚠️ **Klefstad warning**
> Virtual base classes have a key restriction: they **must have a no-argument constructor**. That's because the most-derived class is responsible for directly constructing every virtual base (not via the intermediate classes), and the compiler-generated path uses the default constructor.

> ⚠️ **Klefstad warning (from PPT page 30)**
> "Understanding and using virtual base classes can be difficult." This is widely considered one of the dark corners of C++. Use it only when you genuinely need the diamond pattern.

### 17.6 Square : Virtual Public Shape, Virtual Public Rectangle (PPT page 33)

The PPT shows this example as a teaser of how virtual inheritance composes with constructors:

```cpp
class Square
    : virtual public Shape,
      virtual public Rectangle
{
    int side;
public:
    Square(int cx, int cy, std::string nm, int my_side)
        : Shape(cx, cy, nm),                                   // direct call!
          Rectangle(cx, cy, nm, my_side, my_side),
          side(my_side)
    {
    }
};
```

Two non-obvious things to note:

1. **The most-derived class (`Square`) explicitly calls the virtual base's constructor `Shape(...)`.** Normally, a class calls only its *direct* base constructors, and they in turn call *their* base constructors. But for **virtual** bases, the most-derived class is in charge — calls to `Shape(...)` made by `Rectangle`'s constructor are *ignored* when `Rectangle` is reached through a `Square`.
2. **Both Shape and Rectangle are inherited as `virtual public`.** This ensures only one `Shape` subobject exists in `Square` even though `Rectangle` also inherits from `Shape`.

> 💡 **Klefstad takeaway**: this works, but it's gnarly. Most production code avoids multiple inheritance of concrete classes entirely. Interface inheritance (multiple inheritance where all but one base class are pure abstract interfaces) is much cleaner and is what Java/C# allow exclusively.

### 17.7 Python Comparison

Python supports multiple inheritance natively and resolves ambiguity using **MRO (Method Resolution Order)** computed by the C3 linearization algorithm:

```python
class Base:    
    def foo(self): return "Base"

class Mid1(Base):
    def foo(self): return "Mid1"

class Mid2(Base):
    def foo(self): return "Mid2"

class Bottom(Mid1, Mid2):
    pass

b = Bottom()
print(b.foo())              # "Mid1" — leftmost base wins
print(Bottom.__mro__)       # (Bottom, Mid1, Mid2, Base, object)
```

C++ doesn't compute an automatic MRO — you must explicitly qualify ambiguous calls or override them. This is why C++ multiple inheritance has more sharp edges.

### 17.8 The Rule of Zero

> Corresponds to Klefstad's Topic 7 PPT p2 — extends Week 6's discussion of the Rule of Three / Rule of Five

Week 6 introduced the special member functions (default constructor, destructor, copy constructor, copy assignment, move constructor, move assignment) and the **Rule of Three / Rule of Five**: if a class needs a custom destructor, it almost certainly needs custom copy/move operations too.

The CppCoreGuidelines C.20 inverts the question. Before you write any of those operations, ask: **can I avoid defining them at all?**

> **C.20: If you can avoid defining default operations, do.**
> Reason: It's the simplest and gives the cleanest semantics.

**Example:**

```cpp
struct Named_map {
    // ... NO default operations declared ...
    std::string name;
    std::map<int, int> rep;
};

Named_map nm;              // default constructor — works
Named_map nm2 { nm };      // default copy constructor — works
Named_map nm3 = std::move(nm2);   // default move constructor — works
```

Since `std::string` and `std::map` each have all six special functions correctly defined, the **compiler-generated defaults** for `Named_map` do exactly the right thing — deep-copy on copy, move on move, destroy on destruct.

> 💡 **Key Insight**
> This is known as the **Rule of Zero**: a well-designed class **declares zero** of its own special member functions, because every member already manages its own resources via RAII.

> ⚠️ **Best Practice**
> Aim for Rule of Zero. Only escalate to Rule of Three / Rule of Five when your class manages a **raw resource** that the compiler-generated operations would mishandle — typically a raw pointer to dynamic memory, an OS file handle, a socket, or a mutex.

| Rule | When | What to declare |
|------|------|-----------------|
| Rule of Zero | Default — all members are RAII types | Nothing |
| Rule of Three | Class manages a raw resource (pre-C++11) | Destructor, copy ctor, copy assign |
| Rule of Five | Class manages a raw resource (C++11+) | Destructor + 2 copy + 2 move |

---

## 18. Namespaces

> Corresponds to Klefstad's Topic 7 PPT pp 28–29

### 18.1 Why Namespaces Exist

Before namespaces, C++ (and C) had a single flat **global scope**. Two libraries that both defined a free function `print()` or a class `List` would **collide** at link time. Namespaces solve this by giving each library its own named scope.

> 💡 **Key Insight**
> A namespace is a named region of code into which you put declarations. Two identical names in two different namespaces refer to **two different entities** — there is no conflict.

All C++ Standard Library identifiers live in **namespace `std`**.

### 18.2 Defining a Namespace

```cpp
namespace mySpace {
    class Stack;
    std::ostream& operator<<(std::ostream& out, const Stack& stk);
    void myStackFunction(Stack s);
}
```

Namespaces are **open** — they may be split across files and reopened to add more declarations:

```cpp
// stack.h
namespace mySpace {
    class Stack { /* ... */ };
}

// helpers.h
namespace mySpace {
    void myTopLevelFunction();    // adds to the SAME mySpace
}
```

Everything inside `mySpace { … }` becomes `mySpace::name`.

### 18.3 Three Ways to Use Names in a Namespace

**1. Qualified access — always write `namespace::name`**

```cpp
mySpace::Stack stk;
mySpace::myTopLevelFunction();
myStackFunction(stk);         // OK: ADL finds mySpace::myStackFunction
                              //     (argument-dependent lookup, §18.4)
std::cout << stk;             // OK: std::cout, ADL finds mySpace::operator<<
```

This is the most explicit form — no ambiguity, no surprise.

**2. `using` declaration — bring one name into the current scope**

```cpp
using mySpace::Stack;
using std::cout;

Stack stk;                    // unqualified: Stack means mySpace::Stack here
myStackFunction(stk);
cout << stk;                  // unqualified cout means std::cout
```

This is the moderate option — you opt in name-by-name.

**3. `using namespace` directive — open up the entire namespace**

```cpp
using namespace std;
using namespace mySpace;

Stack stk;
myTopLevelFunction();
myStackFunction(stk);
cout << stk;
```

> ⚠️ **Best Practice**
> Never write `using namespace std;` at file scope inside a **header file** — it leaks into every translation unit that includes the header and effectively undoes the whole point of namespaces. Inside `.cpp` files it's tolerable; inside a small function scope it's fine. The professional default is **qualified `std::`** or narrow `using std::cout;` declarations.

### 18.4 Argument-Dependent Lookup (ADL / Koenig Lookup)

When you call `myStackFunction(stk)` and `stk`'s type lives in `mySpace`, the compiler **automatically** searches `mySpace` for a matching function — even without `mySpace::` qualification. This is **argument-dependent lookup** (a.k.a. Koenig lookup).

This is the magic that makes `std::cout << x` work without writing `std::operator<<(std::cout, x)`: the compiler sees that `std::cout`'s type is in `std`, so it searches `std` for `operator<<`.

### 18.5 Nested Namespaces and Aliases

Namespaces can nest, and the C++17 short form is one line:

```cpp
namespace outer::inner {       // C++17 — same as namespace outer { namespace inner { …
    void f();
}

outer::inner::f();
```

Long namespace names can be aliased:

```cpp
namespace fs = std::filesystem;
fs::path p { "data.txt" };
```

### 18.6 Anonymous Namespaces (File-Local Scope)

A namespace with no name gives its contents **internal linkage** — they're visible only in the current translation unit (like `static` at file scope):

```cpp
namespace {
    int helper(int x) { return x * 2; }   // only this .cpp file can see this
}
```

### 18.7 Python Comparison

Python's **modules** are roughly C++ namespaces:

| C++ | Python |
|------|--------|
| `mySpace::Stack` | `mySpace.Stack` |
| `using mySpace::Stack;` | `from mySpace import Stack` |
| `using namespace mySpace;` | `from mySpace import *` (discouraged in Python too) |
| Anonymous namespace | Leading underscore convention for "private" names |

Same trade-off: qualified access is explicit but verbose; wildcard imports are convenient but risk silent name collision.

---

## 19. Week 7 Comprehensive Cheat Sheet

> One-page summary for quick review

### 19.1 Function Templates

```cpp
template <typename T>
T myMax(T a, T b) { return (a < b) ? b : a; }

myMax<int>(1, 2);     // explicit
myMax<>(1, 2);        // deduce, template-only
myMax(1, 2);          // deduce, non-template preferred if any
```

- Template = stencil; instances generated on demand.
- Instance is generated **once per unique type per translation unit**.
- Static locals are **per instance**, not shared.

### 19.2 Class Templates

```cpp
template <typename T>
class Array {
    T* m_data{};
public:
    Array(int n) : m_data{ new T[n]{} } { /* ... */ }
    T& operator[](int i);
};

template <typename T>
T& Array<T>::operator[](int i) { return m_data[i]; }
```

- Each out-of-class member function needs its **own** `template <typename T>`.
- **Always put template implementations in the header** (or use `.inl` / explicit instantiation) — otherwise linker errors.

### 19.3 Non-Type Template Parameters

```cpp
template <typename T, int N>
class StaticArray { T arr[N] {}; };

StaticArray<int, 12> a;   // size is part of the type
```

- Value must be `constexpr` at the call site.

### 19.4 Lambda Cheat Sheet

```cpp
auto f = [captures](params) -> ret { body };

[]      // no captures
[=]     // default capture by value
[&]     // default capture by reference
[x]     // capture x by value
[&x]    // capture x by reference
[=, &x] // x by ref, everything else by value
[&, x]  // x by value, everything else by ref
[y{expr}]  // declare new variable y inside the lambda
```

| Aspect | Rule |
|---|---|
| Capture by value | Read-only by default; add `mutable` to modify (modifies internal copy) |
| Capture by reference | Modifiable; **be careful with lifetimes** |
| Stored in variable | `auto`, `std::function`, function pointer (no-capture only) |
| Passed to a function | `auto&` (C++20) > template `T&` > `std::function<…>` > function pointer |

### 19.5 Exception Cheat Sheet

| Construct | Syntax |
|---|---|
| Throw | `throw expr;` |
| Try/catch | `try { … } catch (T x) { … }` |
| Catch all | `catch (...) { … }` (must be last) |
| std::exception | `catch (const std::exception& e) { e.what(); }` |
| noexcept | `void f() noexcept;` (no exceptions escape) |

**Matching rules:**
- No implicit conversions between catch types (`int` ≠ `double`).
- Derived **matches** a base handler; put derived **first**.
- Class exceptions: catch by **`const T&`** (avoid copy + slicing).
- Fundamentals: catch by **value**.

**Always `noexcept`:** move ctor/move assign, swap.
**Always non-throwing:** destructors (implicitly).

**Stack unwinding rule:** local variables in functions being unwound **are destroyed**. Uncaught exceptions ⟹ `std::terminate`, **may or may not unwind**.

### 19.6 Friend Functions

```cpp
class Foo {
    int m_value{};
    friend void print(const Foo& f);   // grant friendship
};
void print(const Foo& f) { std::cout << f.m_value; }
```

- Friendship is granted by the class.
- Friends are **not** members — no `this`, must take the class as an explicit parameter.
- Forward-declare a class with `class Foo;` when a friend declaration in another class needs to mention it.
- **Prefer non-friend** when a public accessor suffices.

### 19.7 Stringstream Cookbook

```cpp
#include <sstream>

std::stringstream ss;
ss << 42 << ' ' << 3.14;          // write
std::string all = ss.str();       // get full buffer

int n; double d;
ss >> n >> d;                     // read tokens

ss.str("");                       // clear buffer
ss.clear();                       // clear error flags
```

### 19.8 Multiple Inheritance & Virtual Bases (Carried from Topic 6 PPT)

```cpp
class A : public virtual Base { /* ... */ };
class B : public virtual Base { /* ... */ };
class C : public A, public B { /* ... */ };   // only ONE Base subobject in C
```

- Without `virtual`, diamond inheritance gives you **two** copies of `Base`.
- With `virtual`, only one — but the most-derived class must directly call `Base()`'s constructor.
- Virtual base must have a **no-argument constructor**.
- For ambiguous member names: `obj.Base1::name`.

---

## 20. Top Five Takeaways for Week 7

1. **Templates instantiate on demand, once per unique type, per translation unit.** Template **definitions must be visible** at the point of instantiation — that's why class template implementations live in headers (or `.inl` files), not in `.cpp` files. The linker error "undefined reference to `Array<int>::operator[]`" is the canonical symptom of forgetting this.

2. **Captures are copies (by value) or aliases (by reference) of outer variables, made when the lambda is created.** Capture by value gives a **private snapshot** that persists across calls; `mutable` allows modifying that snapshot. Capture by reference shares the outer variable — **but the captured object must outlive the lambda**, or you have a dangling reference. The most common bug: capturing a local by reference and returning the lambda from the function.

3. **`throw` / `try` / `catch` rules — committed to memory:**
   - **No implicit conversions** in catch matching (`int` ≠ `double`, `char` ≠ `int`).
   - Derived exceptions match a base handler, so put **derived handlers first**.
   - Catch class exceptions by **`const T&`** to avoid copying and to prevent **slicing**.
   - **Catch-all `catch(...)`** must come last.
   - **Stack unwinding** destroys locals in unwound frames (their destructors run) — this is why RAII works.

4. **`noexcept` is a contract, not a compiler-enforced invariant.** The compiler accepts a noexcept function whose body throws — but if any exception escapes a noexcept function, `std::terminate()` fires immediately, often **without** unwinding the stack. Always mark **move constructors, move assignment operators, and swap functions** as `noexcept` so STL containers (especially `std::vector`) can use the move-when-resizing fast path via `std::move_if_noexcept`.

5. **Friendship is granted by the class, not requested by the outsider.** A `friend` declaration lets one named function or class see private/protected members, but it doesn't break encapsulation — it's targeted, explicit, and visible in the class definition. **Prefer non-friend non-member functions** when a small public accessor can do the job equally well. Reserve friendship for cases where the alternative would clutter the public interface with many one-off accessors.

> ⚠️ **PPT-vs.-Reading priority reminder**: When Klefstad's PPT and LearnCpp disagree, **the PPT wins** (it's authoritative for this course). When in doubt about Week 6 vs. Week 7 boundaries, include the content — better to over-cover than under-cover.