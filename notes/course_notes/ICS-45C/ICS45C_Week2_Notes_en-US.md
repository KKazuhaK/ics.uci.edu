# Information and Computer Science 45C — Week 2 Reading Notes

## Table of Contents

- [1. Introduction to Testing Your Code](#1-introduction-to-testing-your-code)
- [2. Programs with Multiple Files and Header Files](#2-programs-with-multiple-files-and-header-files)
- [3. Named Constants](#3-named-constants)
- [4. Increment/Decrement Operators and Side Effects](#4-incrementdecrement-operators-and-side-effects)
- [5. Type Deduction with auto](#5-type-deduction-with-auto)
- [6. Introduction to Compound Data Types](#6-introduction-to-compound-data-types)
- [7. Value Categories: Lvalues and Rvalues](#7-value-categories-lvalues-and-rvalues)
- [8. Lvalue References](#8-lvalue-references)
- [9. Lvalue References to const](#9-lvalue-references-to-const)
- [10. Pass by Reference](#10-pass-by-reference)
- [11. Pass by const Lvalue Reference](#11-pass-by-const-lvalue-reference)
- [12. Introduction to Object-Oriented Programming](#12-introduction-to-object-oriented-programming)
- [13. Introduction to Classes](#13-introduction-to-classes)
- [14. Member Functions](#14-member-functions)
- [15. Const Objects and Const Member Functions](#15-const-objects-and-const-member-functions)
- [16. Public and Private Access Control](#16-public-and-private-access-control)
- [17. Introduction to Constructors](#17-introduction-to-constructors)
- [18. Constructor Member Initializer Lists](#18-constructor-member-initializer-lists)
- [19. Destructors](#19-destructors)
- [20. Classes and Header Files](#20-classes-and-header-files)
- [21. class vs struct](#21-class-vs-struct)
- [22. C Arrays — Lecture Supplement](#22-c-arrays--lecture-supplement)
- [23. C-style Strings](#23-c-style-strings)
- [24. Overloading operator<< and the Reference Parameter Pattern](#24-overloading-operator-and-the-reference-parameter-pattern)
- [25. STL Containers: set and map (Possibly Week 3)](#25-stl-containers-set-and-map-possibly-week-3)
- [26. Basic File I/O (Possibly Week 3)](#26-basic-file-io-possibly-week-3)
- [27. Quick Reference Summary](#27-quick-reference-summary)

> UCI ICS 45C: Programming in C++ (35770)  
> These notes integrate Week 2 Assigned Reading (LearnCpp chapters) with lecture slides, organized in study order.

---

## 1. Introduction to Testing Your Code

> Corresponds to LearnCpp 9.1 — Introduction to testing your code

### 1.1 Why Test?

Writing code doesn't mean the code is correct. Testing means **systematically verifying that your code works as expected**.

Goals of testing:

- Find bugs
- Verify edge cases
- Ensure changes don't introduce new problems (regression testing)

### 1.2 Basic Testing Approaches

**Informal testing:** Manually run the program, enter some values, and check the output. Simple but unreliable — you have to redo it manually every time you change the code.

**Preserving tests:** Write tests inside the code (e.g., in dedicated test functions) so they can be re-run automatically.

### 1.3 Testing Methodology

Your tests should cover the following categories of input:

- **Normal cases**: The most common inputs
- **Edge cases**: Boundary values (e.g., 0, 1, max, min)
- **Error cases**: Invalid inputs — does the program handle them correctly?

```cpp
// Example: testing a function that checks if a number is even
bool isEven(int x) {
    return (x % 2) == 0;
}

// Test cases should include:
// Normal:  isEven(4) -> true,  isEven(7) -> false
// Edge:    isEven(0) -> true,  isEven(1) -> false
// Negative: isEven(-2) -> true, isEven(-3) -> false
```

### 1.4 Unit Testing

Testing a small piece of code (a single function or class) in isolation is called **unit testing**. Each unit test verifies one specific behavior of the unit under test.

LearnCpp's car assembly analogy:

- **Bad approach (Plan B)**: Assemble all parts first, then test the whole car → if something breaks, it's hard to tell which part caused it
- **Good approach (Plan A)**: Test each part individually before assembly, then test again after → catch problems early, one at a time

The same applies to programs: test each function as you write it, rather than running the entire program for the first time at the end.

### 1.5 Evolution of Test Code

**Step 1: Informal testing** — Write temporary test code, verify, then delete.

```cpp
int main() {
    std::cout << isLowerVowel('a') << '\n';  // should print 1
    std::cout << isLowerVowel('q') << '\n';  // should print 0
    return 0;
}
```

**Step 2: Preserving tests** — Move test code into a dedicated test function so it can be re-run later.

```cpp
void testVowel() {
    std::cout << isLowerVowel('a') << '\n';  // should print 1
    std::cout << isLowerVowel('q') << '\n';  // should print 0
}
```

**Step 3: Automated testing** — The test function compares actual vs expected results automatically, no manual checking needed.

```cpp
int testVowel() {
    if (!isLowerVowel('a')) return 1;  // test 1 failed
    if (isLowerVowel('q')) return 2;   // test 2 failed
    return 0;                           // all tests passed
}
```

**Step 4: Testing frameworks** — Use tools like GoogleTest (introduced in Week 1) to manage and run tests.

### 1.6 Integration Testing

After testing individual modules separately, combining and testing them together is called **integration testing**. For now, running the full program and checking its behavior is sufficient.

> 💡 Key principle: **Start testing as soon as you finish a non-trivial function.** Don't wait until the end!

---

## 2. Programs with Multiple Files and Header Files

> Corresponds to LearnCpp 2.8 — Programs with multiple code files  
> Corresponds to LearnCpp 2.11 — Header files

### 2.1 Why Multiple Files?

As a program grows, cramming everything into a single `.cpp` file becomes unmanageable. Splitting into multiple files allows you to:

- **Organize more clearly**: each file handles one area of functionality
- **Compile faster**: modifying one file only requires recompiling that file
- **Collaborate more easily**: different people can work on different files simultaneously

### 2.2 Basic Multi-File Structure

Suppose we have an `add` function defined in a separate file:

```
Project layout:
  main.cpp     — main program
  add.cpp      — definition of the add function
  add.h        — declaration of add (header file)
```

**add.h (header file):**

```cpp
#ifndef ADD_H
#define ADD_H

int add(int x, int y);   // function declaration (forward declaration)

#endif
```

**add.cpp (source file):**

```cpp
#include "add.h"

int add(int x, int y) {   // function definition
    return x + y;
}
```

**main.cpp:**

```cpp
#include <iostream>
#include "add.h"

int main() {
    std::cout << add(3, 4) << '\n';   // output: 7
    return 0;
}
```

### 2.3 Compiling Multiple Files

```bash
g++ -o myprogram main.cpp add.cpp
```

The compiler will:

1. Compile `main.cpp` and `add.cpp` separately into object files (`.o`)
2. The linker combines them into a single executable

> ⚠️ **Key insight**: The compiler **compiles each file independently** — it has no knowledge of other files and doesn't remember what was in previously compiled files. This is by design:
> - Source files can be compiled in any order
> - Modifying one file only requires recompiling that file
> - Reduces naming conflicts between files

So if `main.cpp` wants to use a function defined in `add.cpp`, `main.cpp` must have a **forward declaration** of that function — either written directly or obtained via `#include` of a header file.

**How identifiers are resolved (Key Insight):**

1. Compiler finds a declaration or definition in the current file → uses it directly
2. Definition is in another file → linker connects them
3. Definition not found anywhere → linker error (`unresolved external symbol`)

### 2.4 Purpose of Header Files

Header files (`.h` or `.hpp`) serve one core purpose: **letting multiple `.cpp` files share declarations**.

- Header files contain **declarations**, not definitions
- After a `.cpp` file `#include`s a header, the compiler knows the function/class exists
- Definitions go in the corresponding `.cpp` file

### 2.5 Two Forms of `#include`

```cpp
#include <iostream>     // angle brackets: search system/standard library paths
#include "myheader.h"   // quotes: search current directory first, then system paths
```

Rules:
- Standard library headers → use `<>`
- Your own headers → use `""`

### 2.6 Header Guards

If a header is `#include`d twice, you get duplicate declaration errors. **Header guards** prevent this:

```cpp
#ifndef MY_HEADER_H    // if this macro hasn't been defined yet
#define MY_HEADER_H    // define it

// header content...
int add(int x, int y);

#endif                 // end
```

A simpler alternative supported by most compilers:

```cpp
#pragma once

int add(int x, int y);
```

`#pragma once` has the same effect as `#ifndef`, but is not part of the C++ standard (though virtually all compilers support it).

### 2.7 Header File Best Practices

- Put **declarations** in headers, not **definitions** (except inline functions and class definitions)
- Each `.cpp` file should `#include` its own corresponding header
- Always use header guards
- Never write `using namespace std;` in a header (it pollutes every file that includes it)

**⚠️ Why can't definitions go in headers?** Because it violates the **One Definition Rule (ODR)**:

```cpp
// add.h — WRONG! Definition placed in a header
int add(int x, int y) {
    return x + y;
}
```

If both `main.cpp` and `add.cpp` `#include "add.h"`, the definition of `add()` appears in two translation units. The linker sees two definitions and reports an ODR violation.

| Python | C++ |
|--------|-----|
| `import math` | `#include <cmath>` |
| `from mymodule import func` | `#include "mymodule.h"` |
| Module system prevents duplicate imports automatically | Header guards prevent it manually |

---

## 3. Named Constants

> Corresponds to LearnCpp 5.1 — Constant variables (named constants)

### 3.1 What Are Named Constants?

A named constant is a **variable that cannot be modified after initialization**.

You've already seen `constexpr` in Week 1; here we organize the concept more thoroughly.

### 3.2 const vs constexpr

```cpp
const int x{5};         // runtime constant: can't be changed after initialization
constexpr int y{5};     // compile-time constant: value determined at compile time

const int z{getInput()};     // OK: const can be initialized with a runtime value
// constexpr int w{getInput()};  // ERROR! constexpr must be known at compile time
```

| Keyword | When is the value determined? | Can be initialized with a runtime value? |
|---------|-------------------------------|----------------------------------------|
| `const` | Runtime | Yes |
| `constexpr` | Compile time | No — must be a compile-time constant |

### 3.3 Why Use Named Constants?

```cpp
// Bad: magic number
double area = 3.14159 * r * r;

// Good: named constant
constexpr double pi{3.14159};
double area = pi * r * r;
```

Benefits:

- **Readability**: `pi` is more intuitive than `3.14159`
- **Maintainability**: update in one place and it propagates everywhere
- **Safety**: prevents accidental modification

### 3.4 Naming Conventions

LearnCpp recommends: ordinary `const`/`constexpr` variables can follow normal naming style (e.g., `maxStudents`), not necessarily ALL_CAPS.

However, in lecture slides, the professor uses `STACK_CAPACITY` style (all caps + underscores) for `constexpr`. **Follow your professor's convention.**

### 3.5 What Happens If You Try to Modify a const?

```cpp
const int x{10};
x = 20;   // compile error! cannot modify a const variable
```

The compiler catches this at compile time, preventing the bug before it can run.

---

## 4. Increment/Decrement Operators and Side Effects

> Corresponds to LearnCpp 6.4 — Increment/decrement operators, and side effects

### 4.1 Prefix vs Postfix

```cpp
int x{5};

int a = ++x;   // prefix increment: increment first, then use. x becomes 6, a = 6
int b = x++;   // postfix increment: use first, then increment. b = 6 (old value), x becomes 7
```

| Operation | Syntax | Meaning | Return Value |
|-----------|--------|---------|--------------|
| Prefix increment | `++x` | Increment first, then return | Value after increment |
| Postfix increment | `x++` | Return first, then increment | Value before increment |
| Prefix decrement | `--x` | Decrement first, then return | Value after decrement |
| Postfix decrement | `x--` | Return first, then decrement | Value before decrement |

### 4.2 Detailed Example

```cpp
int x{5};
std::cout << x << '\n';     // output: 5

std::cout << ++x << '\n';   // output: 6 (incremented to 6, then printed)
std::cout << x << '\n';     // output: 6

std::cout << x++ << '\n';   // output: 6 (printed 6, then incremented to 7)
std::cout << x << '\n';     // output: 7
```

### 4.3 Best Practice

**Prefer prefix (`++x`) unless you specifically need postfix behavior.**

Reasons:
- Prefix is more efficient (postfix needs to save a copy of the old value)
- Easier to understand
- In `for` loops, `++i` and `i++` have the same effect, but prefix is conventionally preferred

```cpp
for (int i{0}; i < 10; ++i) {   // prefer ++i
    std::cout << i << '\n';
}
```

### 4.4 Side Effects

A **side effect** is any effect an expression has on the program state beyond just returning a value.

```cpp
x = 5;            // side effect: changes the value of x
++x;              // side effect: changes the value of x
std::cout << x;   // side effect: outputs to the screen
```

### 4.5 ⚠️ Warning: Don't Modify the Same Variable Twice in One Statement

```cpp
int x{1};
x = x++;   // undefined behavior!
```

If the same variable is both read and written within the same expression with no defined ordering, it is **undefined behavior (UB)**.

Rule: **Each variable should be modified at most once per statement.**

More examples:

```cpp
int x{5};
int value{add(x, ++x)};   // undefined behavior!
// C++ does not specify the order in which function arguments are evaluated
// If left is evaluated first: add(5, 6) = 11
// If right is evaluated first: add(6, 6) = 12
// Different compilers may give different results!
```

```cpp
int x{1};
int y = x + ++x;   // unspecified behavior!
// Visual Studio/GCC produce 2 + 2 = 4
// Clang produces 1 + 2 = 3
```

> ⚠️ C++ intentionally leaves the evaluation order of function arguments and operator operands unspecified, giving compilers freedom to optimize.

---

## 5. Type Deduction with auto

> Corresponds to LearnCpp 10.8 — Type deduction for objects using the auto keyword  
> ⚠️ Reading note: understand the concept for now, but don't use auto yet

### 5.1 What Is auto?

`auto` lets the compiler **automatically deduce a variable's type** from its initializer.

```cpp
auto x{5};        // x is int
auto y{3.14};     // y is double
auto z{"hello"};  // z is const char* (not std::string!)
```

### 5.2 Benefits of auto

- Less typing
- Especially useful when type names are very long (you'll appreciate this with templates/iterators later)

```cpp
// without auto
std::vector<std::string>::iterator it = names.begin();

// with auto
auto it = names.begin();
```

### 5.3 Caveats

- `auto` variables **must be initialized** (the compiler needs a value to deduce the type)
- The deduced type may not be what you expect
- **`auto` drops `const` by default**:

```cpp
auto x{5};     // x is int
auto y{5.0};   // y is double
auto z{5.0f};  // z is float

const int a{10};
auto b{a};     // b is int (NOT const int — const is dropped!)

// To preserve const, add it explicitly:
const auto c{a};     // c is const int
constexpr auto d{5}; // d is constexpr int
```

### 5.4 auto in Range-based for Loops

Lecture slides frequently use this pattern:

```cpp
for (auto s : A) cout << s;     // auto deduces element type
for (auto E : S) cout << E;     // set iteration
for (auto E : A) cout << E.first << E.second;  // map iteration
```

This is currently the most common use of `auto`.

### 5.5 Course Requirements

The reading explicitly states: **understand the concept of auto, but don't use it for now** (except in range-based for loops, which is idiomatic).

---

## 6. Introduction to Compound Data Types

> Corresponds to LearnCpp 12.1 — Introduction to compound data types

### 6.1 Fundamental Types vs Compound Types

The types you learned in Week 1 (`int`, `double`, `char`, `bool`) are **fundamental types**.

**Compound types** are built from fundamental types or other compound types.

### 6.2 Compound Types in C++

C++ has many compound types; the ones introduced in Week 2 are:

| Compound Type | Description | Example |
|---------------|-------------|---------|
| **Reference** | An alias for an existing object | `int& ref = x;` |
| **Pointer** | Stores the address of an object | `int* ptr = &x;` |
| **Array** | A contiguous collection of same-type elements | `int a[5];` |
| **Enum** | A user-defined discrete value type | `enum Color { Red, Green, Blue };` |
| **Class** | A user-defined compound data type | `class Student { ... };` |
| **Struct** | Almost identical to class | `struct Point { int x, y; };` |

Week 2 focus: **references** and **classes**.

---

## 7. Value Categories: Lvalues and Rvalues

> Corresponds to LearnCpp 12.2 — Value categories (lvalues and rvalues)

### 7.1 What Are Value Categories?

Every C++ expression has not only a type, but also a **value category**.

The two most important value categories:

- **Lvalue**: an expression with a persistent identity; its address can be taken
- **Rvalue**: a temporary expression with no persistent identity

### 7.2 How to Tell Them Apart

```cpp
int x{5};

// x is an lvalue: it has a name, a memory address, and persists until the scope ends
// 5 is an rvalue: it's just a temporary literal

x = 10;    // OK: lvalue can appear on the left side of =
// 10 = x; // ERROR: rvalue cannot appear on the left side of =
```

### 7.3 Modifiable vs Non-modifiable Lvalues

Lvalues come in two sub-types:

```cpp
int x{5};               // x is a modifiable lvalue
const double d{3.14};   // d is a non-modifiable lvalue

x = 10;    // OK: x is a modifiable lvalue
// d = 2.0; // ERROR: d is a non-modifiable lvalue (it's const)
```

The assignment operator `=` requires a **modifiable lvalue** on its left side. This explains why `5 = x` and assigning to a `const` variable both fail.

### 7.4 Common Lvalues and Rvalues

Common **lvalues**:
- Variable names: `x`, `myString`
- Functions returning a reference (covered later)
- Array elements: `a[0]`
- **C-style string literals**: `"Hello"` is an lvalue (an exception!)

Common **rvalues**:
- Literals (except C-style string literals): `5`, `3.14`, `'A'`
- Expression results: `x + 1` (a temporary)
- Non-reference function return values: `add(3, 4)`
- `static_cast` results: `static_cast<int>(d)`

### 7.5 Why Does the Distinction Matter?

This is critical for understanding **references**:

- An ordinary reference (`int&`) can only bind to an **lvalue**
- A `const` reference (`const int&`) can bind to both **lvalues and rvalues**

> 💡 Memory trick: lvalue = **named, addressed, long-lived**; rvalue = **temporary, one-time-use**.

---

## 8. Lvalue References

> Corresponds to LearnCpp 12.3 — Lvalue references

### 8.1 What Is a Reference?

A **reference** is an **alias** for an existing variable.

```cpp
int x{5};
int& ref{x};   // ref is a reference (alias) for x

std::cout << x << '\n';     // output: 5
std::cout << ref << '\n';   // output: 5

ref = 10;                    // modify through the reference
std::cout << x << '\n';     // output: 10 (x changed too!)
```

`ref` and `x` are **the same thing** — just two different names for the same object.

### 8.2 References vs Pointers

| Feature | Reference `int&` | Pointer `int*` |
|---------|-----------------|----------------|
| Syntax | `int& ref = x;` | `int* ptr = &x;` |
| Can be null | No — must bind to an object | Yes — can be `nullptr` |
| Can be rebound | No — once bound, always bound | Yes — `ptr = &y;` |
| How to use | Use `ref` directly | Must dereference: `*ptr` |
| Must initialize at declaration | Yes | No (but recommended) |

> 💡 A reference is like a nickname: if "Alex" is also called "Al", calling either name refers to the same person. And once you give someone a nickname, you can't transfer that nickname to someone else.

### 8.3 Rules for References

```cpp
int x{5};
int& ref{x};      // OK: reference binds to lvalue x

// int& ref2{5};   // ERROR! ordinary reference cannot bind to an rvalue
// int& ref3;      // ERROR! reference must be initialized at declaration
```

The three iron rules of references:

1. **Must be initialized at declaration** (this process is called **reference binding**; the bound object is called the **referent**)
2. **Non-const references can only bind to modifiable lvalues** (const references are an exception, see next section)
3. **Cannot be rebound to a different object once bound (not resealable)**

```cpp
int x{5};
const int y{10};

int& ref1{x};      // OK: x is a modifiable lvalue
// int& ref2{y};   // ERROR! y is a non-modifiable lvalue (const)
// int& ref3{5};   // ERROR! 5 is an rvalue
```

> ⚠️ Why can't a non-const reference bind to a const lvalue? Because if it could, you'd be able to modify a const variable through the reference — violating the const promise.

### 8.4 Reference Types Must Match

```cpp
int x{5};
int& ref{x};       // OK
// double& ref2{x}; // ERROR! type mismatch
```

> 💡 Placement of `&`: `int& ref` and `int &ref` mean the same thing to the compiler, but modern C++ convention places `&` near the type (`int& ref`), since "reference" is **part of the type information**.

### 8.5 Reference Lifetime

A reference is not an independent object — it has no storage of its own. It's simply another name for the object it's bound to.

The **referent's** lifetime must be at least as long as the reference. If the referent is destroyed while a reference still exists, the reference becomes a **dangling reference** — using it is undefined behavior.

---

## 9. Lvalue References to const

> Corresponds to LearnCpp 12.4 — Lvalue references to const

### 9.1 What Is a const Reference?

```cpp
int x{5};
const int& ref{x};   // ref is a const reference to x

std::cout << ref << '\n';   // output: 5 (can read)
// ref = 10;                // ERROR! cannot modify through a const reference
x = 10;                     // OK: x itself is not const
std::cout << ref << '\n';   // output: 10 (ref reflects the updated x)
```

A `const` reference means: **through this reference, you can only read, not write**. But if the original variable is not `const`, it can still be modified directly.

### 9.2 const References Can Bind to Rvalues!

This is a special ability of `const` references:

```cpp
const int& ref{5};   // OK! const reference can bind to an rvalue (literal)
```

An ordinary reference cannot do this:

```cpp
// int& ref{5};   // ERROR!
```

How it works: the compiler creates a temporary object to hold the rvalue, and the `const` reference binds to that temporary.

**Lifetime extension of temporary objects**: normally a temporary is destroyed when the expression ends. But if a `const` reference **directly binds** to a temporary, C++ extends the temporary's lifetime to match the reference.

```cpp
const int& ref{5};           // temporary's lifetime is extended to match ref
std::cout << ref << '\n';    // safe! prints 5
// ref and the temporary are both destroyed when the scope ends
```

### 9.3 const References Can Bind to Different Types

A `const` reference can even bind to a **different type** (as long as implicit conversion is possible):

```cpp
const double& r1{5};    // 5 (int) converted to a temporary double; r1 binds to it
char c{'a'};
const int& r2{c};       // c (char) converted to a temporary int; r2 binds to it

std::cout << r2 << '\n'; // prints 97 (ASCII of 'a'), because r2 is an int reference
```

> ⚠️ In these cases, the reference binds to the **temporary**, not the original variable. Changing the original variable does not affect the reference, and vice versa.

### 9.4 const Reference Binding Rules Summary

| Reference Type | Bind to modifiable lvalue? | Bind to non-modifiable lvalue? | Bind to rvalue? | Can modify? |
|----------------|---------------------------|-------------------------------|-----------------|-------------|
| `int&` | Yes | No | No | Yes |
| `const int&` | Yes | Yes | Yes | No |

> 💡 `const int&` is a "universal reader": it can see everything, but can't change anything.

---

## 10. Pass by Reference

> Corresponds to LearnCpp 12.5 — Pass by lvalue reference

### 10.1 Recap: The Problem with Pass by Value

From Week 1, C++ passes by value by default:

```cpp
void addOne(int x) {
    ++x;   // only modifies the copy
}

int a{5};
addOne(a);
std::cout << a << '\n';   // output: 5 (a unchanged)
```

Two problems with pass by value:

1. **Cannot modify the original variable**
2. **Copying large objects is expensive** (imagine copying a 100 MB object)

### 10.2 Pass by Reference Solves the Problem

```cpp
void addOne(int& x) {   // x is a reference parameter
    ++x;   // modifies the original!
}

int a{5};
addOne(a);
std::cout << a << '\n';   // output: 6 (a was modified!)
```

When a function parameter is declared as `int&`, the argument is not copied — it **binds directly to the original variable**.

### 10.3 Pass by Reference Only Accepts Lvalues

```cpp
void addOne(int& x) { ++x; }

int a{5};
addOne(a);     // OK: a is an lvalue
// addOne(5);  // ERROR! 5 is an rvalue, cannot bind to int&
```

### 10.4 Comparison: Pass by Value vs Pass by Reference

| Feature | Pass by value `int x` | Pass by reference `int& x` |
|---------|----------------------|---------------------------|
| Copies the argument | Yes | No |
| Can modify original | No | Yes |
| Accepts rvalues | Yes | No |

> 💡 A great analogy from lecture: pass by value is like "emailing someone a PDF" (they can edit their copy, but the original is unchanged); pass by reference is like "sending someone a Google Doc link" (their edits affect the original).

### 10.5 Comparison with Python

Python's argument passing is similar to "pass by reference," but with a subtle difference:

```python
def add_one(lst):
    lst.append(1)   # affects the original list
```

```cpp
// C++ requires explicit & to achieve the same effect
void addElement(vector<int>& v) {
    v.push_back(1);
}
```

---

## 11. Pass by const Lvalue Reference

> Corresponds to LearnCpp 12.6 — Pass by const lvalue reference

### 11.1 Why Pass by const Reference?

Sometimes we pass by reference purely for **efficiency** (to avoid copying), but we don't want to modify the original. Use `const` reference:

```cpp
void printValue(const int& x) {
    std::cout << x << '\n';
    // x = 10;   // ERROR! cannot modify through a const reference
}

int a{5};
printValue(a);    // OK
printValue(5);    // Also OK! const reference can accept rvalues
```

### 11.2 Parameter-Passing Decision Guide

**This is one of the most important practical rules in Week 2 (LearnCpp's Rule of Thumb):**

> **Pass fundamental types and enums by value; pass class types by const reference.**  
> When in doubt, use `const` reference — it's harder to get wrong.

| Situation | Recommended | Reason |
|-----------|-------------|--------|
| Fundamental types (`int`, `double`, `char`, `bool`) and enums | Pass by value `int x` | Small types — cheap to copy |
| Need to modify the original | Pass by reference `int& x` | Can modify |
| Class type objects, no modification needed | const reference `const string& s` | Avoid copying without accidental modification |
| Non-copyable types (e.g., `ostream`) | Pass by reference `ostream& out` | These types don't support copying at all |

```cpp
void process(const std::string& name) {   // string may be large; use const& to avoid copy
    std::cout << "Hello, " << name << '\n';
}
```

> ⚠️ **Type mismatch warning**: make sure argument types match reference parameter types! If they don't match (e.g., passing `int` to `const double&`), the compiler creates a temporary for the conversion, and the reference binds to the temporary rather than the original. This can cause unexpected behavior and extra copy overhead.

### 11.3 Mixing Parameter-Passing Styles

A single function can use different passing styles for different parameters:

```cpp
void foo(int a, int& b, const std::string& c) {
    // a: pass by value, b: pass by reference, c: pass by const reference
}
```

### 11.4 Full Comparison of Three Passing Styles

| Feature | `int x` | `int& x` | `const int& x` |
|---------|---------|----------|----------------|
| Copies | Yes | No | No |
| Can modify original | No | Yes | No |
| Accepts lvalues | Yes | Yes | Yes |
| Accepts rvalues | Yes | No | Yes |

---

## 12. Introduction to Object-Oriented Programming

> Corresponds to LearnCpp 14.1 — Introduction to object-oriented programming

### 12.1 What Is OOP?

In **procedural programming**, a program is organized as a series of functions, with data and functions kept separate.

In **object-oriented programming (OOP)**:

- Data and the functions that operate on it are **packaged together** into **objects**
- Objects are instances of a **class**

### 12.2 Core Concepts of OOP

- **Encapsulation**: bundling data and methods together, hiding internal details
- **Inheritance**: one class can inherit properties and methods from another (covered in later weeks)
- **Polymorphism**: the same interface can have different implementations (covered in later weeks)

Week 2 focuses on **encapsulation**.

### 12.3 Comparison with Python

```python
class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def bark(self):
        print(f"{self.name} says Woof!")
```

C++ classes are fundamentally the same as Python classes: they bind data and behavior together. The syntax is different, but the concept is identical.

---

## 13. Introduction to Classes

> Corresponds to LearnCpp 14.2 — Introduction to classes

### 13.1 Defining a Class

```cpp
class Complex {
    float re, im;          // data members (private by default)
public:
    // member functions covered in subsequent sections
};
```

### 13.2 Why Use class Instead of Just struct?

A `struct` has a problem: it cannot effectively enforce **class invariants**.

A **class invariant** is a condition that must always be true for the lifetime of an object. For example:

```cpp
struct Fraction {
    int numerator{0};
    int denominator{1};   // invariant: denominator must not be 0
};

Fraction f{5, 0};   // problem! struct can't prevent users from creating invalid objects
```

As an aggregate, `struct` lets users directly access and set any value — there's no way to prevent invalid state. A **class** solves this with private members and constructors: the constructor can validate arguments.

### 13.3 Basic Structure of a Class

A class contains:

- **Data members (member variables)**: store data
- **Member functions (methods)**: operate on the data
- **Access control**: `public` / `private`

### 13.4 Creating Objects

```cpp
Complex c1(1.5, 5.3);   // create a Complex object
Complex c2(2.5, 2.7);   // create another
```

Each object has **its own copy of data members**, but **shares the same set of member functions**.

### 13.5 Class vs Python Class

| Python | C++ |
|--------|-----|
| `class Dog:` | `class Dog { };` |
| Members are public by default | Members are **private** by default |
| `self.name` | Use `name` directly (implicit `this`) |
| `__init__` | Constructor (same name as the class) |
| Can add attributes dynamically | All members must be declared inside the class |

---

## 14. Member Functions

> Corresponds to LearnCpp 14.3 — Member functions  
> Combined with lecture slides: The Hidden 'this' Parameter

### 14.1 Defining Member Functions

```cpp
class Complex {
    float re, im;
public:
    Complex add(Complex c) {
        return Complex(re + c.re, im + c.im);
    }
    
    void print(ostream& out) const {
        out << "(" << re << "+" << im << "i)";
    }
};
```

> 💡 **Member functions defined inside the class definition are implicitly inline**, so even if the class definition is `#include`d by multiple `.cpp` files, there's no ODR violation. This is why short getters/setters are typically written directly inside the class definition.

### 14.2 The Hidden this Parameter

Every member function has a **hidden additional parameter** called `this` — a pointer to the object that invoked it.

```cpp
void print(ostream& out) const {
    out << "(" << re << "+" << im << "i)";
    // re is actually this->re
    // im is actually this->im
}
```

Analogous to Python's `self`:

| Python | C++ |
|--------|-----|
| `self` must be declared explicitly as the first parameter | `this` is hidden — no need to declare it |
| `self.re` | `re` or `this->re` |

### 14.3 Calling Member Functions

```cpp
Complex c1(1.0, 1.0);
Complex c2(2.0, 1.0);
Complex result = c1.add(c2);   // c1 is this; c2 is the parameter c
result.print(cout);             // result is this
```

Use the `.` operator to call member functions. The object on the left of the dot becomes `this`.

### 14.4 Member Functions Can Access Private Members of Any Instance

Member functions can access the private members of **any object of the same class**:

```cpp
Complex add(Complex c) {
    return Complex(re + c.re, im + c.im);
    //              ^         ^
    //              this->re  c.re (even though re is private, we can access c's re)
}
```

This may be surprising: `add` can access not only `this->re` but also `c.re`. **Objects of the same class have no privacy from each other.**

---

## 15. Const Objects and Const Member Functions

> Corresponds to LearnCpp 14.4 — Const class objects and const member functions

### 15.1 Const Objects

```cpp
const Complex c1(1.0, 2.0);   // c1 is a const object
// c1's data members cannot be modified
```

### 15.2 Const Member Functions

If a member function **does not modify any data members**, it should be marked `const`:

```cpp
void print(ostream& out) const {   // note the position of const
    out << "(" << re << "+" << im << "i)";
}
```

`const` is placed after the parameter list but before the function body.

### 15.3 Why Const Member Functions Are Needed

**Const objects can only call const member functions:**

```cpp
const Complex c(1.0, 2.0);
c.print(cout);    // OK: print is a const member function
// c.add(other);  // ERROR if add is not const
```

Rules:
- const object → can only call const member functions
- Non-const object → can call both const and non-const member functions

### 15.4 Best Practice

**All member functions that don't modify the object's state should be declared const.**

This mirrors the principle of `const` reference parameters: add `const` wherever possible to limit modification rights.

---

## 16. Public and Private Access Control

> Corresponds to LearnCpp 14.5 — Public and private members and access specifiers  
> Combined with lecture slides: Public or Private

### 16.1 Three Access Levels

| Access Level | Access Specifier | Member Access | Derived Class Access | Public Access |
|-------------|-----------------|---------------|---------------------|---------------|
| Public | `public:` | yes | yes | yes |
| Protected | `protected:` | yes | yes | no |
| Private | `private:` | yes | no | no |

A class type is allowed to use any number of access specifiers in any order, and they can be used repeatedly (e.g. you can have some public members, then some private ones, then more public ones).

### 16.2 Syntax

```cpp
class Complex {
private:              // the following members are private
    float re, im;
    
public:               // the following members are public
    Complex(float newRe = 0.0, float newIm = 0.0);
    Complex add(Complex c);
    void print(ostream& out) const;
};
```

### 16.3 Default Access Level for class Is private

```cpp
class Foo {
    int x;      // private by default
public:
    int y;      // explicitly public
};
```

### 16.4 Encapsulation Analogy

From lecture — a great analogy:

- **public** (interface) = steering wheel, accelerator, brake pedal → what the user directly interacts with
- **private** (implementation) = engine, transmission, fuel injection system → internal details the user doesn't need to and shouldn't touch directly

### 16.5 Simple Rules (Week 2 Stage)

- **Data members → private**
- **Most member functions, constructors, and destructors → public**
- **Helper functions → can be private** (e.g., possibly used in HW3)

```cpp
class Stack {
    int _top;                       // private: data member
    char buf[STACK_CAPACITY];       // private: data member
public:
    Stack() { }                     // public: constructor
    void push(char c) { }          // public: user interface
    bool isFull() { }              // public: user interface
};
```

---

## 17. Introduction to Constructors

> Corresponds to LearnCpp 14.9 — Introduction to constructors  
> Combined with lecture slides: Defining a Constructor

### 17.1 What Is a Constructor?

A **constructor** is a special member function that is **called automatically when an object is created**.

Purpose: initialize the object's data members.

```cpp
class Complex {
    float re, im;
public:
    Complex(float newRe = 0.0, float newIm = 0.0)
        : re(newRe), im(newIm)     // member initializer list
    {
        // constructor body (can do other work here)
    }
};
```

### 17.2 Special Properties of Constructors

- The function name **is the same as the class name**
- **No return type** (not even `void`)
- Called **automatically** when an object is created
- Can have parameters and default arguments
- **Constructors cannot be declared const** (they need to modify members to initialize them)

> ⚠️ **Constructors don't create the object**: the compiler allocates memory first, then calls the constructor on that uninitialized memory. The constructor's job is *initialization*, not *creation*. But if no matching constructor is found, the compiler will error and prevent object creation.

### 17.3 Default Constructors

A **default constructor** is one that can be called with no arguments:

```cpp
Complex();                              // no parameters
Complex(float newRe = 0.0, float newIm = 0.0);  // all parameters have defaults — also callable with no args
```

```cpp
Complex c1;              // calls the default constructor
Complex c2(1.0, 2.0);   // calls the parameterized constructor
Complex c3{};            // calls the default constructor (brace initialization)
```

### 17.4 ⚠️ Don't Add Empty Parentheses When Creating Objects

```cpp
Complex result;       // OK: calls the default constructor
// Complex result();  // ERROR! This is parsed as a function declaration, not object creation!
Complex result{};     // OK: brace initialization is safer
```

This is a notorious C++ pitfall called the **"most vexing parse."**

### 17.5 When Is the Constructor Called?

Object lifetime:

```
1) Memory allocation
2) Constructor call      ← here
3) Object's active lifetime (in use)
4) Destructor call
5) Memory deallocation
```

The constructor is called after memory is allocated and before the object is used.

### 17.6 Comparison with Python

```python
class Complex:
    def __init__(self, re=0.0, im=0.0):
        self.re = re
        self.im = im
```

```cpp
class Complex {
    float re, im;
public:
    Complex(float newRe = 0.0, float newIm = 0.0)
        : re(newRe), im(newIm) {}
};
```

| Python | C++ |
|--------|-----|
| `__init__(self, ...)` | `ClassName(...)` |
| `self.re = re` | `: re(newRe)` in initializer list |
| Always has explicit `self` | Implicit `this` |

---

## 18. Constructor Member Initializer Lists

> Corresponds to LearnCpp 14.10 — Constructor member initializer lists

### 18.1 What Is a Member Initializer List?

A member initializer list (MIL) is the syntax used to **directly initialize data members** in a constructor:

```cpp
Complex(float newRe, float newIm)
    : re(newRe), im(newIm)    // ← this is the member initializer list
{
    // function body
}
```

Written after `:`, separated by commas, before the function body `{}`.

### 18.2 Initializer List vs Assignment in the Body

```cpp
// Option 1: member initializer list (preferred)
Complex(float newRe, float newIm)
    : re(newRe), im(newIm)
{ }

// Option 2: assignment in the body (not recommended)
Complex(float newRe, float newIm)
{
    re = newRe;   // this is assignment, not initialization
    im = newIm;
}
```

The difference:

- Initializer list: **directly constructs** the member (one step)
- Body assignment: **default-constructs** the member first, then **assigns** over it (two steps)

**Always prefer member initializer lists.** Some types (e.g., `const` members, reference members) **must** use them — they cannot be assigned in the body.

### 18.3 Initialization Priority

When an object is constructed, each member is initialized according to this priority:

1. If the member appears in the **member initializer list** → use the list's value
2. Otherwise, if the member has a **default member initializer** → use the default
3. Otherwise → default initialization (for fundamental types, this means **uninitialized — garbage!**)

```cpp
class Foo {
    int m_x{};      // default member initializer: 0
    int m_y{2};     // default member initializer: 2
    int m_z;        // no initializer
public:
    Foo(int x)
        : m_x{x}    // m_x uses the list value (priority 1)
    { }
    // m_y not in the list — uses default value 2 (priority 2)
    // m_z not in the list and no default — uninitialized! (priority 3, dangerous!)
};

Foo foo{6};
// m_x = 6, m_y = 2, m_z = garbage (undefined behavior if read)
```

### 18.4 Initialization Order

Members are initialized **in the order they are declared**, not in the order they appear in the initializer list:

```cpp
class Foo {
    int a;    // declared first → initialized first
    int b;    // declared second → initialized second
public:
    Foo() : b(1), a(2) {}   // even though b appears first in the list, a is initialized first
};
```

**⚠️ This can cause serious bugs:**

```cpp
class Foo {
    int m_x{};
    int m_y{};
public:
    Foo(int x, int y)
        : m_y{std::max(x, y)}, m_x{m_y}   // DANGEROUS!
    { }
};

Foo foo{6, 7};
// m_x is initialized first (declared first), but uses m_y — which hasn't been initialized yet
// → m_x gets a garbage value!
// m_y is then initialized to 7
```

Best practice: keep the initializer list order consistent with the declaration order. Avoid using one member to initialize another.

---

## 19. Destructors

> Combined with lecture slides: Defining a Destructor

### 19.1 What Is a Destructor?

A **destructor** is called **automatically when an object is destroyed**, and is used to clean up resources.

```cpp
class Complex {
    float re, im;
public:
    ~Complex() {   // destructor: tilde + class name
        cout << "Complex number ";
        print(cout);
        cout << " is about to die.\n";
    }
};
```

### 19.2 Properties of Destructors

- Named `~ClassName`
- No parameters
- No return type
- Each class has at most one destructor
- Called automatically when the object goes out of scope

### 19.3 Complete Object Lifetime Example

```cpp
int main() {
    Complex c1(1.5, 5.3);   // c1 constructed
    Complex c2(2.5, 2.7);   // c2 constructed
    {
        Complex result;       // result constructed (default: 0, 0)
        result = c1.add(c2);  // assignment (involves construction and destruction of temporaries)
    }                         // result destroyed (leaves inner scope)
    c1 = Complex(2.0, 3.0);  // temporary constructed, assigned to c1, temporary destroyed
    return 0;
}                             // c2 destroyed, then c1 destroyed (last constructed → first destroyed)
```

> ⚠️ Remember from Week 1: it's **Destruction**, not ~~Deconstruction~~.

---

## 20. Classes and Header Files

> Corresponds to LearnCpp 15.2 — Classes and header files  
> Combined with lecture slides: Declaring a Class / Defining Member Functions

### 20.1 The Typical Separation Pattern

A class is typically split into two files:

```
Complex.hpp — class declaration
Complex.cpp — member function definitions
```

### 20.2 Header File (.hpp): Class Declaration

```cpp
// Complex.hpp
#ifndef COMPLEX_HPP
#define COMPLEX_HPP

#include <iostream>

class Complex {
private:
    float re, im;
public:
    Complex(float newRe = 0.0, float newIm = 0.0);
    Complex add(Complex c);
    void print(std::ostream& out) const;
};

std::ostream& operator<<(std::ostream& out, const Complex& c);

#endif
```

The header file contains:

- The **complete class definition** (not just a forward declaration — the compiler needs the full definition to compute object sizes and verify member usage)
- Declarations of non-member functions (e.g., `operator<<`)
- Header guard
- **Short accessor functions (getters/setters) can be defined directly inside the class definition** in the header (they are implicitly inline)

### 20.3 Source File (.cpp): Member Function Definitions

```cpp
// Complex.cpp
#include "Complex.hpp"

Complex::Complex(float newRe, float newIm)
    : re(newRe), im(newIm) {
}

Complex Complex::add(Complex c) {
    return Complex(re + c.re, im + c.im);
}

void Complex::print(std::ostream& out) const {
    out << "(" << re << "+" << im << "i)";
}
```

Note the use of the **scope resolution operator `::`**:

- `Complex::Complex(...)` → constructor of the Complex class
- `Complex::add(...)` → add method of the Complex class
- `void Complex::print(...)` → print method of the Complex class

> ⚠️ If a member function is `const`, **both the declaration and the definition must include `const`**:
> - Header: `void print(std::ostream& out) const;`
> - Source: `void Complex::print(std::ostream& out) const { ... }`

### 20.4 Why Separate?

- **Compilation efficiency**: modifying a `.cpp` only requires recompiling that file
- **Clear interface**: reading `.hpp` tells you what the class offers
- **Hidden implementation**: when distributing a library, you can ship only `.hpp` and compiled `.o` files, keeping the source private

### 20.5 Using the Class

```cpp
// main.cpp
#include "Complex.hpp"

int main() {
    Complex one_i(1.0, 1.0);
    Complex two_i(2.0, 1.0);
    Complex result = one_i.add(two_i);
    result.print(cout);
}
```

---

## 21. class vs struct

> Combined with lecture slides: class vs. struct

### 21.1 The Only Difference

```cpp
struct Complex {
private:             // struct defaults to public, so private must be written explicitly
    float re, im;
public:
    // ...
};

class Complex {
    float re, im;    // class defaults to private — no need to write it
public:
    // ...
};
```

**The only difference: default access level**

| | `class` | `struct` |
|--|---------|---------|
| Default access | `private` | `public` |

Beyond that, `class` and `struct` are completely identical in C++.

### 21.2 Convention

- Simple data-only types with no complex behavior → use `struct`
- Types with encapsulation and complex behavior → use `class`

---

## 22. C Arrays — Lecture Supplement

> From Week 2 lecture slides

### 22.1 Arrays as Function Parameters

```cpp
void fill(int a[], int N) {
    for (int i = 0; i < N; ++i) {
        a[i] = i;
    }
}

void print(int a[], int N) {
    for (int i = 0; i < N; ++i) {
        cout << a[i] << ' ';
    }
    cout << endl;
}
```

**Key point**: when you pass an array to a function, you're actually passing a pointer (the address of the first element). Modifying the array inside the function **affects the original**. This is effectively **automatic pass by reference**.

### 22.2 Array Initialization

```cpp
constexpr int len = 5;
int a[len] = {0};   // all elements initialized to 0
```

`= {0}` means: set the first element to 0; the remaining elements are **zero-initialized** as well.

### 22.3 Out-of-Bounds Access

```cpp
int a[5] = {0};
a[-1] = 0;     // undefined behavior!
a[5] = 999;    // also undefined behavior! (valid indices are 0–4)
```

Unlike Python, C++ won't throw an exception. Out-of-bounds access may:

- Corrupt another variable's memory
- Crash the program
- "Appear to work" while silently corrupting state

### 22.4 Range-based for and Array Parameters

```cpp
int main() {
    constexpr int len = 5;
    string A[len] = {"Mo", "Tu", "We", "Th", "Fr"};
    
    for (auto s : A) cout << s;           // OK: in main, the compiler knows the array size
    for (int i = 0; i < len; ++i) cout << A[i];  // OK
}

void f(string P[], int len) {
    // for (auto s : P) cout << s;        // BROKEN! array decays to pointer; size is lost
    for (int i = 0; i < len; ++i) cout << P[i];  // OK: use index-based loop
}
```

**Key distinction**: once an array is passed as a parameter, it **decays to a pointer** and range-based for no longer works.

### 22.5 char as Array Index

```cpp
int counts[26] = {0};   // counter for each letter

// Wrong:
// ++counts['A'];  // 'A' has ASCII value 65 — out of bounds!

// Correct:
char letter = 'C';
int index = letter - 'A';   // 'C' - 'A' = 2
++counts[index];             // correct!
```

`char` is fundamentally an integer (its ASCII value) and supports arithmetic. Subtracting `'A'` maps a letter to the range 0–25.

---

## 23. C-style Strings

> From Week 2 lecture slides

### 23.1 What Is a C-style String?

A C-style string is a `char` array terminated by a **null character `'\0'`**.

```cpp
char s[12] = "Hello World";   // Why 12? 11 characters + 1 '\0'
char s2[] = "Hello World";    // compiler automatically sizes to 12
char s3[12];                  // uninitialized! contains garbage
char* s4 = "Hello World";    // points to a string literal (do not modify)
char* s5;                     // uninitialized pointer! dangerous!
```

### 23.2 Physical Length vs Logical Length

```
Physical length: total allocated size of the array (e.g., 128)
Logical length:  number of valid characters (before '\0')
```

Similar to HW1's Stack: the array has a physical capacity, but only part of it is in use.

### 23.3 Iterating over C-style Strings

```cpp
char s[128] = "Hello World";

// Method 1: s.size() — NO! C arrays have no .size() method
// for (int i = 0; i < s.size(); ++i)  // compile error

// Method 2: strlen() — works, but slow (recomputes length on every iteration)
for (int i = 0; i < strlen(s); ++i)
    cout << s[i] << endl;

// Method 3: range-based for — works, but iterates the entire physical array
// for (auto c : s)  // will iterate all 128 elements

// Method 4: check '\0' — correct and efficient
for (int i = 0; s[i] != '\0'; ++i)
    cout << s[i] << endl;

// Method 5: pointer iteration — correct and idiomatic C style
for (char* p = s; *p != '\0'; ++p)
    cout << *p << endl;
```

Methods 4 and 5 are the recommended ways to iterate over C-style strings.

---

## 24. Overloading operator<< and the Reference Parameter Pattern

> Combined with lecture slides: Defining Inserter: operator<<

### 24.1 Why Overload operator<<?

We want to output custom types like this:

```cpp
Complex mySink(3.4, 2.2);
cout << "Sink at location: " << mySink << endl;
```

To make this work, we need to define `operator<<`.

### 24.2 operator<< Must Be a Non-member Function

```cpp
// Must be defined as a non-member function!
ostream& operator<<(ostream& out, const Complex& c) {
    c.print(out);   // delegate to the class's print method
    return out;      // return ostream& to support chaining
}
```

**Why can't it be a member function?** Because `cout << c` implies the left operand is `cout` (type `ostream`), and we can't modify the `ostream` class.

### 24.3 Why Return ostream&?

Returning a reference enables **chained calls**:

```cpp
cout << "value: " << mySink << endl;
// equivalent to:
((cout << "value: ") << mySink) << endl;
```

Without returning a reference, chaining would break.

### 24.4 Decoding the Parameter Signatures

```cpp
ostream& operator<<(ostream& out, const Complex& c)
```

- `ostream& out`: pass by reference — `ostream` cannot be copied
- `const Complex& c`: const reference — efficient, and doesn't modify `c`
- Returns `ostream&`: reference return to support chaining

### 24.5 Similarly, Overloading operator>>

```cpp
istream& operator>>(istream& in, Complex& c) {
    c.read(in);     // note: c is NOT const — we need to modify it
    return in;
}
```

---

## 25. STL Containers: set and map (Possibly Week 3)

> ⚠️ The following content appears in Week 2–3 slides but is not in the Week 2 assigned reading. Recorded here for reference.

### 25.1 set

```cpp
#include <set>

set<char> S;
for (char c = 'A'; c <= 'Z'; ++c)
    S.insert(c);

for (char c = 'Z'; c >= 'A'; --c)
    S.insert(c);   // duplicate inserts have no effect — set de-duplicates automatically

for (auto E : S)
    cout << E << endl;   // prints A through Z, each once

if (S.find('A') != S.end())
    cout << "A is in there" << endl;
```

Characteristics:
- Automatically **de-duplicates**
- Elements automatically **sorted**
- Search with `find()`, returns an iterator

Analogous to Python's `set`.

### 25.2 map

```cpp
#include <map>
#include <string>

map<string, int> A;
A["Bill"] = 33;
A["George"] = 29;
A["Al"] = 27;

for (auto E : A)
    cout << E.first << " is " << E.second << " ";
// output: Al is 27 Bill is 33 George is 29 (sorted by key alphabetically)
```

Characteristics:
- Key-value pair storage
- Sorted **by key**
- `E.first` is the key, `E.second` is the value

Analogous to Python's `dict`, but C++'s `map` is always ordered.

---

## 26. Basic File I/O (Possibly Week 3)

> ⚠️ Also appears in Week 2–3 slides, not in Week 2 assigned reading.

### 26.1 Basic File Read/Write

```cpp
#include <fstream>

int main() {
    ifstream in("input.txt");    // open file for reading
    ofstream out("output.txt");  // open file for writing
    
    string word;
    while (in >> word) {          // read word by word; returns false at EOF
        out << word << endl;
    }
    
    in.close();
    out.close();
}
```

- `ifstream`: input file stream — for reading files
- `ofstream`: output file stream — for writing files
- `>>` and `<<` work exactly like `cin`/`cout`

---

## 27. Quick Reference Summary

### References

| Concept | Syntax | Key Point |
|---------|--------|-----------|
| Lvalue reference | `int& ref = x;` | Must bind to lvalue; can modify |
| const reference | `const int& ref = x;` | Binds to lvalues/rvalues; cannot modify |
| Pass by value | `void f(int x)` | Copies; original unaffected |
| Pass by reference | `void f(int& x)` | No copy; can modify original |
| Pass by const reference | `void f(const int& x)` | No copy; no modification; most flexible |

### Class Quick Reference

| Concept | Syntax | Key Point |
|---------|--------|-----------|
| Declare a class | `class Foo { };` | Defaults to private |
| Constructor | `Foo(int x) : member(x) { }` | Same name as class; no return type |
| Destructor | `~Foo() { }` | Tilde + class name |
| Const member function | `void f() const { }` | const objects can only call const functions |
| Initializer list | `: a(x), b(y)` | Prefer this over body assignment |
| Access member | `obj.member` | Dot operator |
| Scope resolution | `Foo::func()` | Used when defining member functions in .cpp |

### Multi-file Quick Reference

| Element | Where it goes | Notes |
|---------|--------------|-------|
| Function declaration | `.h` / `.hpp` | Add header guard |
| Function definition | `.cpp` | `#include` its corresponding header |
| Class declaration | `.hpp` | Include all member declarations |
| Member function definition | `.cpp` | Qualify with `ClassName::` |

### Parameter-Passing Decision Guide

```
Do you need to modify the original?
├── Yes → void f(Type& x)
└── No  → Is it a fundamental type (int, double, char, bool)?
    ├── Yes → void f(Type x)          // pass by value
    └── No  → void f(const Type& x)  // pass by const reference
```

### Python vs C++ Comparison (Week 2 additions)

| Python | C++ | Notes |
|--------|-----|-------|
| `import module` | `#include "module.h"` | Module / header file |
| Auto-prevents duplicate imports | Needs header guard | `#ifndef` / `#pragma once` |
| `self` | `this` (implicit) | Reference/pointer to current object |
| `__init__` | `ClassName(...)` | Constructor |
| `del obj` or GC | `~ClassName()` | Destructor |
| `class Foo:` | `class Foo { };` | Define a class |
| Members default to public | Members default to **private** | Access control |
| `dict` | `map<K,V>` | Map (C++ version is sorted) |
| `set` | `set<T>` | Set (C++ version is sorted) |
| No reference concept | `int& ref = x;` | Variable alias |
| No const concept | `const int x{5};` | Compiler-enforced immutability |

**The 5 most important takeaways from Week 2:**

1. **A reference is an alias, not a copy**: `int& ref = x` makes `ref` and `x` the same object
2. **Prefer const reference for parameters**: use `const Type&` for large objects; pass fundamental types by value
3. **class defaults to private, struct defaults to public**: that is the only difference
4. **Use member initializer lists in constructors**: `: member(value)` is better than body assignment
5. **Mark non-modifying member functions const**: if a function doesn't modify the object's state, it must be const
