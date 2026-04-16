# ICS 45C — Week 4 Integrated Reading Notes

## Table of Contents

- [1. Literals](#1-literals)
- [2. Constant Expressions](#2-constant-expressions)
- [3. Constexpr Variables](#3-constexpr-variables)
- [4. The Conditional Operator](#4-the-conditional-operator)
- [5. C-style String Symbolic Constants](#5-c-style-string-symbolic-constants)
- [6. Dynamic Memory Allocation with new and delete](#6-dynamic-memory-allocation-with-new-and-delete)
- [7. Dynamically Allocating Arrays](#7-dynamically-allocating-arrays)
- [8. Pointers, References, and Arrays — Lecture Supplement](#8-pointers-references-and-arrays--lecture-supplement)
- [9. Introduction to the Copy Constructor](#9-introduction-to-the-copy-constructor)
- [10. Class Initialization and Copy Elision](#10-class-initialization-and-copy-elision)
- [11. Shallow vs Deep Copying](#11-shallow-vs-deep-copying)
- [12. Overloading the Assignment Operator](#12-overloading-the-assignment-operator)
- [13. Move Constructors and Move Assignment](#13-move-constructors-and-move-assignment)
- [14. The Rule of Three — Lecture Supplement](#14-the-rule-of-three--lecture-supplement)
- [15. Class Vector / IntList — Lecture Supplement](#15-class-vector--intlist--lecture-supplement)
- [16. Week 4 Cheat Sheet and Pitfalls](#16-week-4-cheat-sheet-and-pitfalls)

> UCI ICS 45C: Programming in C++ (35770)
> These notes integrate Week 4's assigned reading (LearnCpp chapters) with the PPT slides (Arrays, Brief Tour of C++, class and struct, Strings, Dynamic Allocation of Arrays), organized in the order of study.
> The PPT covers Weeks 4–5; these notes follow the Reading list, with Week 5 topics called out.

---

## 1. Literals

> Corresponds to LearnCpp 5.2 — Literals

### 1.1 What is a Literal?

A **literal** is a value written directly into the code, whose meaning cannot be redefined (`5` always means the integer value 5). Literals are also called **literal constants**.

```cpp
return 5;                     // 5 is an integer literal
bool myNameIsAlex { true };   // true is a boolean literal
double d { 3.4 };             // 3.4 is a double literal
std::cout << "Hello, world!"; // "Hello, world!" is a C-style string literal
```

### 1.2 Default Types of Literals

Like objects, literals have types. The type is deduced from the literal's value:

| Literal kind | Example | Default type | Notes |
|---|---|---|---|
| Integer | `5`, `0`, `-3` | `int` | |
| Boolean | `true`, `false` | `bool` | |
| Floating-point | `1.2`, `0.0`, `3.4` | `double` (**not float!**) | |
| Character | `'a'`, `'\n'` | `char` | Single quotes |
| C-style string | `"Hello, world!"` | `const char[14]` | Double quotes |

> ⚠️ **Pitfall**: `float f { 4.1 };` triggers a compiler warning! Because `4.1` is a `double` literal by default, and assigning it to a `float` loses precision.

Fix:
```cpp
float f { 4.1f };   // ✅ Use the f suffix to make the literal a float
double d { 4.1 };   // ✅ Or change the variable's type to double
```

### 1.3 Literal Suffixes

| Data type | Suffix | Meaning |
|---|---|---|
| Integer | `u` or `U` | unsigned int |
| Integer | `l` or `L` | long |
| Integer | `ll` or `LL` | long long |
| Floating-point | `f` or `F` | float |
| Floating-point | `l` or `L` | long double |
| String | `s` | std::string |
| String | `sv` | std::string_view |

> 💡 **Best Practice**: Except for `f`, most cases don't need suffixes. Prefer uppercase `L` over lowercase `l` (lowercase l and the digit 1 look alike in some fonts).

### 1.4 Scientific Notation

```cpp
double avogadro { 6.02e23 };      // 6.02 × 10^23
double protonCharge { 1.6e-19 };  // 1.6 × 10^-19
```

### 1.5 Two Properties of C-style String Literals

1. **Implicit null terminator**: `"hello"` actually has 6 characters: `'h'`, `'e'`, `'l'`, `'l'`, `'o'`, `'\0'`.
2. **Storage location**: Usually placed in read-only memory (covered in detail in 17.11).

---

## 2. Constant Expressions

> Corresponds to LearnCpp 5.4 (in some editions 5.5) — Constant Expressions

### 2.1 Why Evaluate at Compile Time?

By default, expressions are evaluated at **runtime**. But some expressions can be evaluated at **compile time** — this is called **compile-time programming**.

Benefits of compile-time evaluation:

| Benefit | Explanation |
|---|---|
| **Performance** | Smaller and faster programs |
| **Versatility** | Usable where compile-time values are required (e.g., array lengths) |
| **Predictability** | The compiler can be forced to evaluate certain code at compile time, or error out |
| **Quality** | Compile-time code disallows undefined behavior, so some bugs are caught at compile time |

### 2.2 Definition of a Constant Expression

A **constant expression** is a non-empty sequence of literals, constant variables, operators, and function calls, **where every part can be evaluated at compile time**.

```cpp
// These are constant expressions
3 + 4
2 * sizeof(int)

// This is NOT a constant expression (cin >> x is runtime-only)
std::cin >> x;
```

### 2.3 What Can a Constant Expression Contain?

- **Literals**
- **Most operators with constant-expression operands**
- **Integral const variables initialized with a constant expression** (a historical special case)
- **constexpr variables** (see next section)
- **constexpr functions** (where the call arguments are constant expressions)

### 2.4 The as-if Rule

The compiler is free to optimize the program as long as the observable behavior is the same:

```cpp
const double x { 1.2 };
const double y { 3.4 };
const double z { x + y };  // x + y might be computed as 4.6 at compile time, or at runtime
```

> ⚠️ **Problem with the as-if rule**: We cannot force the compiler to evaluate at compile time. That's why we need `constexpr`.

---

## 3. Constexpr Variables

> Corresponds to LearnCpp 5.5 — Constexpr Variables

### 3.1 Why Do We Need constexpr?

Using `const` alone to create "compile-time constants" has several flaws:

1. It's unclear whether a variable can actually be used as a constant expression
2. There's no way to tell the compiler "I **require** a compile-time constant"
3. `const` doesn't apply to non-integral types (historical rule)

### 3.2 Semantics of constexpr

`constexpr` is short for "constant expression". **A constexpr variable is always a compile-time constant** — if the initializer is not a constant expression, the compiler errors out.

```cpp
#include <iostream>

int five() { return 5; }  // An ordinary function; its return value is not constexpr

int main()
{
    constexpr double gravity { 9.8 };  // ✅ 9.8 is a constant expression
    constexpr int sum { 4 + 5 };       // ✅ 4 + 5 is a constant expression
    constexpr int something { sum };   // ✅ sum is a constant expression

    std::cin >> age;
    constexpr int myAge { age };  // ❌ Compile error! age is not a constant expression
    constexpr int f { five() };   // ❌ Compile error! return value of ordinary function is not constexpr

    return 0;
}
```

### 3.3 const vs constexpr Comparison

| Property | `const` | `constexpr` |
|---|---|---|
| Immutable after initialization | ✅ | ✅ |
| Initializer must be known at compile time | ❌ | ✅ |
| Usable in a constant expression | Only integral types with constant-expression initializer | Always |
| Usable as array length | Only the integral special case | ✅ |

> 💡 **Best Practice**:
> - Initializer is a constant expression → use `constexpr`
> - Initializer is a runtime constant → use `const`
> - Note: dynamic-memory types like `std::string` and `std::vector` are **not compatible with constexpr**; use `const`, or switch to a constexpr-friendly type (such as `std::string_view`, `std::array`).

### 3.4 const vs constexpr on Function Parameters

Function calls happen at runtime, and parameter initialization also happens at runtime. Therefore:

1. `const` function parameters are treated as runtime constants (even if a compile-time constant is passed in)
2. **Function parameters cannot be declared `constexpr`** (their initializer isn't known until runtime)

```cpp
void foo(const int x) { ... }      // ✅ OK
void bar(constexpr int x) { ... }  // ❌ Not allowed
```

### 3.5 Terminology Reference

| Term | Definition |
|---|---|
| **Compile-time constant** | A value or immutable object known at compile time |
| **Constexpr variable** | A variable that is guaranteed to be a compile-time constant |
| **Constant expression** | An expression where every part can be evaluated at compile time |
| **Runtime constant** | A constant whose value is only determined at runtime |
| **Runtime expression** | An expression evaluated at runtime |

---

## 4. The Conditional Operator

> Corresponds to LearnCpp 6.6 — The Conditional Operator

### 4.1 Basic Syntax

The **conditional operator `?:`** (also called the "ternary operator") is the only three-operand operator in C++.

```cpp
condition ? expression1 : expression2;
// If condition is true, evaluate expression1; otherwise evaluate expression2
```

| Operator | Symbol | Form | Meaning |
|---|---|---|---|
| Conditional | `?:` | `c ? x : y` | x if c is true, otherwise y |

### 4.2 Typical Usage

```cpp
// Traditional if-else
if (x > y)
    max = x;
else
    max = y;

// Equivalent conditional-operator form
max = ((x > y) ? x : y);
```

**Python comparison**: Python's ternary expression is `max = x if x > y else y`; C++'s syntax order is different.

### 4.3 Why Do We Need It? (Can Be Used for Initialization)

Some contexts **only accept an expression**, not an if-else statement. For example, variable initialization:

```cpp
constexpr bool inBigClassroom { false };
constexpr int classSize { inBigClassroom ? 30 : 20 };  // Only ?: works here

// The code below won't compile!
if (inBigClassroom)
    constexpr int classSize { 30 };     // classSize lives inside the if block; destroyed on exit
else
    constexpr int classSize { 20 };
std::cout << classSize;  // ❌ classSize is undefined
```

### 4.4 The Parentheses Trap (Important!)

> ⚠️ **Serious pitfall**: Most operators have higher precedence than `?:`. Without parentheses, things go wrong.

**Example 1: arithmetic precedence**
```cpp
int z { 10 - x > y ? x : y };
// You think it's: 10 - (x > y ? x : y)       → result 8
// It actually is: ((10 - x) > y) ? x : y     → result 2
```

**Example 2: `<<` has higher precedence than `?:`**
```cpp
int x { 2 };
std::cout << (x < 0) ? "negative" : "non-negative";
// Actual evaluation order: (std::cout << (x < 0)) ? "negative" : "non-negative"
// First prints 0 (false), then the whole expression becomes a string that is discarded
// Output: 0 (not "non-negative"!)
```

> 💡 **Best Practice**:
> - When using the conditional operator inside a compound expression, **wrap the entire conditional operation in parentheses**
> - For readability, also parenthesize the condition part if it contains operators
>
> ```cpp
> std::cout << ((x > y) ? x : y);  // ✅ Whole operation parenthesized
> ```

### 4.5 The Two Operand Types Must Match (or Be Convertible)

The two operands (`expression1` and `expression2`) must have matching types, or types that can be implicitly converted to a common type. Otherwise the compiler errors out.

---

## 5. C-style String Symbolic Constants

> Corresponds to LearnCpp 17.11 — C-style String Symbolic Constants

### 5.1 Two Declaration Styles

C++ supports two ways to create C-style string symbolic constants:

```cpp
#include <iostream>

int main()
{
    const char name[] { "Alex" };          // Style 1: const C-style string
    const char* const color{ "Orange" };   // Style 2: const pointer to a string literal

    std::cout << name << ' ' << color << '\n';
    // Output: Alex Orange
    return 0;
}
```

### 5.2 Memory Differences Between the Two Styles

| Style | Memory behavior |
|---|---|
| `const char name[] { "Alex" }` | `"Alex"` is placed in (possibly read-only) memory, then a 5-char array is allocated for `name` and copied into. **Two copies of "Alex" in memory** — a bit wasteful for a constant. |
| `const char* const color { "Orange" }` | The compiler typically places `"Orange"` in read-only memory, then initializes the pointer with its address. **Only one copy.** |

### 5.3 Literal Pooling Optimization

Because string literals are constants, the compiler may merge identical literals into a single shared copy:

```cpp
const char* name1 { "Alex" };
const char* name2 { "Alex" };
// The two pointers may point to the same address
```

### 5.4 Type Deduction for C-style Strings

```cpp
auto s1{ "Alex" };    // Deduced as const char*
auto* s2{ "Alex" };   // Deduced as const char*
auto& s3{ "Alex" };   // Deduced as const char(&)[5]
```

### 5.5 Pitfall When Printing Pointers

`std::cout` has special handling for `char*` and `const char*`: **it treats them as C strings to print**, not addresses!

```cpp
int narr[]{ 9, 7, 5, 3, 1 };
char carr[]{ "Hello!" };
const char* ptr{ "Alex" };

std::cout << narr << '\n';  // Prints the address (e.g., 003AF738)
std::cout << carr << '\n';  // Prints "Hello!"
std::cout << ptr << '\n';   // Prints "Alex"
```

> ⚠️ **Serious trap**: trying to print the address of a `char` variable goes wrong!
> ```cpp
> char c{ 'Q' };
> std::cout << &c;  // ❌ &c is char*; cout treats it as a string.
>                    // Since c has no '\0' terminator, trailing memory garbage gets printed!
> // Possible output: Q╠╠╠╠╜╡4;¿■A
> ```
>
> **Fix**: cast to `const void*`
> ```cpp
> std::cout << static_cast<const void*>(ptr) << '\n';  // Prints the actual address
> ```

### 5.6 Best Practice

> 💡 **Best Practice**: Avoid C-style string symbolic constants; prefer `constexpr std::string_view`.

---

## 6. Dynamic Memory Allocation with new and delete

> Corresponds to LearnCpp 19.1 — Dynamic Memory Allocation with new and delete

### 6.1 Three Kinds of Memory Allocation in C++

| Kind | Variables | When allocated | Lifetime |
|---|---|---|---|
| **Static** | globals, static variables | Once, at program start | Whole program run |
| **Automatic** | function parameters, locals | On entering scope | Destroyed on leaving scope |
| **Dynamic** | objects allocated with `new` | Explicit request at runtime | Until `delete` |

### 6.2 Why Do We Need Dynamic Allocation?

Static and automatic allocation share two limitations:

1. The size must be **known at compile time**
2. Allocation/deallocation is **automatic**

> **Example**: You want to store a user-entered name, but the length isn't known at compile time.
> ```cpp
> char name[25];  // Hope the user's name is no longer than 25 chars...
> ```

This "guess the maximum" approach has serious problems:
1. Wastes memory
2. You don't know how much was actually used
3. Stack memory is limited (Visual Studio default: 1MB)
4. Can overflow (e.g., user enters 600 records but you only allocated 500)

### 6.3 Stack vs Heap

Ordinary variables (including fixed arrays) live on the **stack**, which is small but automatically managed.
Dynamically allocated memory comes from the **heap** (a.k.a. the **free store**), which is much larger (possibly gigabytes) but must be managed by the programmer.

> 💡 **Key Insight**:
> - Stack objects: allocation/deallocation is **automatic**, no pointer needed
> - Heap objects: allocation/deallocation is **manual**, and you must refer to the object through a pointer (memory address)

### 6.4 Dynamically Allocating a Single Variable

```cpp
int* ptr { new int };       // Dynamically allocate an int; ptr holds its address
*ptr = 7;                    // Modify via dereference

int* ptr1 { new int(5) };    // Direct initialization
int* ptr2 { new int{ 6 } };  // Brace initialization (recommended)
```

### 6.5 Releasing Memory with delete

```cpp
delete ptr;       // Returns the memory to the OS
ptr = nullptr;    // Set pointer to null to avoid misuse
```

> ⚠️ **Important clarification**: `delete` **does not delete the variable!** It only returns the **memory** to the OS. The pointer variable itself still exists, with the same scope as any ordinary variable.

### 6.6 Dangling Pointer

A **dangling pointer** points to already-freed memory. Dereferencing or re-deleting a dangling pointer is **undefined behavior (UB)**!

```cpp
int* ptr { new int };
*ptr = 7;

delete ptr;          // ptr is now a dangling pointer
std::cout << *ptr;   // ❌ UB! Accessing freed memory
delete ptr;          // ❌ UB! Deleting the same memory twice
```

> 💡 **Habit**: Immediately after `delete`, set `ptr = nullptr`, so that even if misused it's just a null-pointer dereference rather than a dangling one.

### 6.7 Three Common Pointer Errors

| Error | Description | Consequence |
|---|---|---|
| **Uninitialized pointer** | Using a pointer before initializing it | Segmentation Violation (SIGSEGV), a.k.a. "Seg Fault" |
| **Dangling pointer** | Points to a freed object | UB (hard to debug) |
| **Memory leak** | Lose the pointer; memory can never be freed | Memory usage grows indefinitely |
| **Redundant delete** | Delete the same memory twice | UB |

> 💡 **Wisdom (emphasized in PPT)**: **Restrict dynamic memory allocation to class implementations** (shown later with `class Vector`).

---

## 7. Dynamically Allocating Arrays

> Corresponds to LearnCpp 19.2 — Dynamically Allocating Arrays

### 7.1 new[] and delete[]

Unlike a fixed array, a dynamic array allows specifying the length **at runtime**:

```cpp
#include <cstddef>
#include <iostream>

int main()
{
    std::size_t length{};
    std::cin >> length;

    int* array { new int[length]{} };  // With array new, the length can be a variable
    array[0] = 5;

    delete[] array;  // Free with array delete
    return 0;
}
```

> ⚠️ **Critical rule**: **`new[]` must be paired with `delete[]`; `new` must be paired with `delete`. Mixing them is UB!**

### 7.2 Relationship Between Dynamic Array and Fixed Array

A dynamic array's lifetime starts with "a pointer to the first element." **Functionally it's equivalent to a decayed fixed array** — it doesn't know its own length.

Difference: a dynamic array must be freed manually with `delete[]`.

### 7.3 Initializing a Dynamic Array

```cpp
int* arr1 { new int[length]{} };             // ✅ All initialized to 0
int* arr2 { new int[5]{ 9, 7, 5, 3, 1 } };   // ✅ Initializer list allowed since C++11
auto* arr3 { new int[5]{ 9, 7, 5, 3, 1 } };  // auto for brevity
```

> ⚠️ **Syntax note**: `new int[5]{ ... }` — there is **no `=`** between the length and the `{ ... }`.

### 7.4 How Can delete[] Free an Unknown Length?

`new[]` internally records the number of bytes allocated, so `delete[]` knows how much to free. But **this length info is not visible to the programmer**!

### 7.5 Resize

C++ **has no built-in way** to resize an already-allocated array. You must:
1. Allocate a new array
2. Copy the elements over
3. Delete the old array

This is error-prone, especially when elements are class objects.

> 💡 **Best Practice**: For variable-length arrays, use `std::vector`.

---

## 8. Pointers, References, and Arrays — Lecture Supplement

> Corresponds to the first few pages of the PPT "Dynamic Allocation of Arrays" (Prof. Klefstad's slides)

### 8.1 Pointers vs References

Both hold the **address** of an object and provide access to it:

| Property | Reference | Pointer |
|---|---|---|
| Declaration | `int& j = i;` | `int* p = &i;` |
| Initialization | **Must be bound at construction** | Can be assigned later |
| Rebindable | ❌ No | ✅ Yes |
| Nullable | ❌ Cannot be null | ✅ Can be `nullptr` |
| Syntax | Use `j` directly | Dereference `*p`; member access `p->` |

```cpp
int i = 10;
int* p = &i;   // & gives the address of i; p is a pointer
int& j = i;    // j is a reference to i

i = 50;    // Modify i directly
*p = 60;   // Modify i indirectly (via pointer)
j = 70;    // Modify i indirectly (via reference)
```

### 8.2 Arrays and Pointers

In C++, **an array name is a constant pointer to the first element**.

```cpp
int a[4];
int b[2];
int* p = a;           // Equivalent to p = &a[0]
*p = 10;              // Equivalent to a[0] = 10
p[0] = 20;            // Also a[0] = 20

p = b;                // p can be pointed at a different array
p[1] = 70;
*(p+1) = 90;          // Pointer arithmetic: equivalent to p[1]
```

> 💡 **Key Insight**: `p[i]` is equivalent to `*(p + i)`. This is why arrays and pointers can be used interchangeably.

### 8.3 Character Array vs Character Pointer

```cpp
char s1[] = "Hello";      // An array; data lives on the stack; writable
char* s2 = "Hello";       // A pointer to a string literal; data is in read-only memory!
char* s3 = s1;            // s3 points to s1's data

s3[0] = 'M';   // ✅ Modifies s1[0], giving "Mello"
s2[0] = 'M';   // ❌ Segmentation fault! String literals are immutable
```

> ⚠️ **Common mistake**: `char* s = "Hello";` produces a warning in modern C++ (should be `const char*`) because string literals are read-only.

### 8.4 Limitations of Fixed Arrays

1. Size must be **known at compile time**
2. Cannot **grow/shrink** after allocation
3. Actual usage may vary

→ This is exactly why **dynamically allocated arrays** are needed.

> "With great power comes great responsibility." — Dynamic memory must be managed by hand.

---

## 9. Introduction to the Copy Constructor

> Corresponds to LearnCpp 14.14 — Introduction to the Copy Constructor

### 9.1 What Is a Copy Constructor?

A **copy constructor** is a constructor used to **initialize a new object from an existing object**. After it runs, the new object is a copy of the one passed in.

```cpp
class Fraction
{
private:
    int m_numerator{ 0 };
    int m_denominator{ 1 };
public:
    Fraction(int numerator=0, int denominator=1)
        : m_numerator{numerator}, m_denominator{denominator} {}

    void print() const {
        std::cout << "Fraction(" << m_numerator << ", " << m_denominator << ")\n";
    }
};

int main()
{
    Fraction f { 5, 3 };   // Calls Fraction(int, int)
    Fraction fCopy { f };  // Calls the copy constructor!
    f.print();
    fCopy.print();
}
/* Output:
Fraction(5, 3)
Fraction(5, 3)
*/
```

### 9.2 Implicit Copy Constructor

If you **don't write** a copy constructor, the compiler generates an **implicit copy constructor**. It performs **memberwise initialization** — each member is initialized from the corresponding member of the passed-in object.

### 9.3 Defining Your Own Copy Constructor

```cpp
class Fraction
{
    ...
public:
    // Copy constructor
    Fraction(const Fraction& fraction)
        : m_numerator{ fraction.m_numerator }
        , m_denominator{ fraction.m_denominator }
    {
        std::cout << "Copy constructor called\n";
    }
};
```

> 💡 **Key Insight**: Member functions of a class can access **the private members of other objects of the same class**! Access control is per-class, not per-object. That's why `fraction.m_numerator` works directly.

### 9.4 Two Core Rules of the Copy Constructor

> 💡 **Best Practice 1**: A copy constructor **should have no side effects beyond copying**. The compiler may optimize it away (copy elision), and side effects might not run!

> 💡 **Best Practice 2**: **The copy constructor parameter must be a reference** (ideally a `const` lvalue reference):
> ```cpp
> Fraction(const Fraction& f) { ... }  // ✅
> Fraction(Fraction f) { ... }          // ❌ Compile error!
> ```
>
> **Reason**: If the parameter is pass-by-value, calling the copy constructor would itself require copying the parameter → which calls the copy constructor → infinite recursion.

> 💡 **Best Practice 3**: **Prefer the implicit copy constructor**, unless you have special needs (e.g., the class contains pointers).

### 9.5 Pass by Value Triggers the Copy Constructor

When an object is **passed by value** to a function, the parameter is initialized via the copy constructor:

```cpp
void printFraction(Fraction f) {  // Pass by value
    f.print();
}

int main() {
    Fraction f{ 5, 3 };
    printFraction(f);  // Calls the copy constructor to copy f into the parameter
}
```

### 9.6 Return by Value Triggers the Copy Constructor

When a function returns an object by value, the **temporary object** is initialized from the return value via the copy constructor:

```cpp
Fraction makeFrac() {
    Fraction local{3, 4};
    return local;  // Copy constructor creates the temporary (but may be elided)
}
```

---

## 10. Class Initialization and Copy Elision

> Corresponds to LearnCpp 14.15 — Class Initialization and Copy Elision
> (Note: per the instructor, **this section excludes copy elision**; for completeness, a brief intro is given at the end.)

### 10.1 Six Forms of Initialization

C++ has 6 initialization forms for fundamental types; they apply to class objects too:

```cpp
int a;          // default initialization (uninitialized)
int b = 5;      // copy initialization
int c( 6 );     // direct initialization

// List initialization (C++11)
int d { 7 };    // direct list initialization (recommended!)
int e = { 8 };  // copy list initialization
int f {};       // value initialization
```

### 10.2 Corresponding Class Initialization

```cpp
class Foo {
public:
    Foo() { std::cout << "Foo()\n"; }                          // Default ctor
    Foo(int x) { std::cout << "Foo(int) " << x << '\n'; }      // Ordinary ctor
    Foo(const Foo&) { std::cout << "Foo(const Foo&)\n"; }      // Copy ctor
};

int main() {
    // Calls default ctor
    Foo f1;          // default initialization
    Foo f2{};        // value initialization (recommended)

    // Calls Foo(int)
    Foo f3 = 3;      // copy initialization (only for non-explicit ctors)
    Foo f4(4);       // direct initialization
    Foo f5{ 5 };     // direct list initialization (recommended!)
    Foo f6 = { 6 };  // copy list initialization

    // Calls Foo(const Foo&) — copy ctor
    Foo f7 = f3;     // copy initialization
    Foo f8(f3);      // direct initialization
    Foo f9{ f3 };    // direct list initialization (recommended!)
    Foo f10 = { f3 };// copy list initialization
}
```

### 10.3 Three Key Differences Among Copy / Direct / List Initialization

For class types, copy, direct, and list initialization **do essentially the same thing** — they initialize the object. But there are 3 key differences:

| Difference | Explanation |
|---|---|
| **List initialization** | **Forbids narrowing conversions** |
| **Copy initialization** | Only considers **non-explicit** constructors/conversions |
| **List initialization** | Prefers to match a **list constructor** (`std::initializer_list`) |

> 💡 **Best Practice**: Prefer **direct list initialization** (`Foo f{5};`); it prevents narrowing conversions.

### 10.4 Copy Elision (Brief Intro — Not a Week 4 Focus)

> The following **may belong to Week 5**: copy elision

**Copy elision** is a compiler optimization: at certain points where a copy constructor would be called, it is **omitted entirely**.

```cpp
Something s { Something{ 5 } };  // Logically: construct temporary, then copy to s
// After elision: equivalent to Something s{ 5 } — only the ordinary ctor runs
```

This is exactly why a copy constructor **should not have side effects** — if elided, the side effects won't run!

---

## 11. Shallow vs Deep Copying

> Corresponds to LearnCpp 21.13 — Shallow vs. Deep Copying

### 11.1 Shallow Copy

The compiler-provided default copy constructor and copy assignment use **memberwise copy**, also called **shallow copy**.

**For simple classes (no dynamic memory), this works fine**:

```cpp
class Fraction {
    int m_numerator, m_denominator;
    // The compiler-generated default roughly looks like:
    Fraction(const Fraction& f)
        : m_numerator{ f.m_numerator }
        , m_denominator{ f.m_denominator } {}
};
```

### 11.2 Shallow Copy Is Disastrous for Classes with Pointers!

**Shallow-copying a pointer just copies the address — it doesn't allocate new memory or copy what's pointed to!**

```cpp
class MyString {
    char* m_data{};
    int m_length{};
public:
    MyString(const char* source) {
        m_length = std::strlen(source) + 1;
        m_data = new char[m_length];
        for (int i = 0; i < m_length; ++i)
            m_data[i] = source[i];
    }
    ~MyString() { delete[] m_data; }
};
```

**Since no copy constructor was written, the compiler provides a shallow-copy one. Look at this broken code**:

```cpp
int main() {
    MyString hello{ "Hello, world!" };
    {
        MyString copy{ hello };  // Shallow copy: copy.m_data and hello.m_data point to the same memory!
    }  // copy is destructed and delete[]s the shared memory
    // Now hello.m_data is a dangling pointer!

    std::cout << hello.getString();  // ❌ UB! Accessing freed memory
}
```

> 💡 **Key Insight**: Shallow-copying pointer members is **almost always trouble**:
> 1. Two objects share the same memory → modifying one affects the other
> 2. One is destructed and delete[]s the shared memory → the other becomes dangling
> 3. When both are destructed, double-delete → UB

### 11.3 Deep Copy

A **deep copy** allocates **independent memory** for the new object and **copies the contents**, so the two objects are fully independent in memory.

```cpp
class MyString {
    ...
    void deepCopy(const MyString& source) {
        // 1. Release the currently held memory
        delete[] m_data;

        // 2. Non-pointer members can be copied shallowly
        m_length = source.m_length;

        // 3. Pointer members: allocate new memory and copy contents
        if (source.m_data) {
            m_data = new char[m_length];
            for (int i = 0; i < m_length; ++i)
                m_data[i] = source.m_data[i];
        } else {
            m_data = nullptr;
        }
    }

    // Copy constructor: no need to delete first (new object, nothing to release)
    MyString(const MyString& source) { deepCopy(source); }

    // Copy assignment: check for self-assignment
    MyString& operator=(const MyString& source) {
        if (this != &source) {  // self-assignment check
            deepCopy(source);
        }
        return *this;
    }
};
```

### 11.4 When to Write a Custom Copy Constructor / Assignment?

> 💡 **Golden rule**: **Whenever a class holds a pointer (manages dynamic memory), you must define these three:**
> 1. **Copy constructor**
> 2. **Copy assignment operator**
> 3. **Destructor**
>
> This is called the **Rule of Three**, see Section 14.

### 11.5 A Better Option

Writing your own copy/assignment is error-prone. **Template classes (`std::string`, `std::vector`) already handle this for you** — prefer them!

---

## 12. Overloading the Assignment Operator

> Corresponds to LearnCpp 21.12 — Overloading the Assignment Operator

### 12.1 Copy Constructor vs Copy Assignment

| Aspect | Copy Constructor | Copy Assignment |
|---|---|---|
| Purpose | **Initialize a new object** from an existing one | **Assign** one object to an **already existing** one |
| When called | At object birth (including pass/return by value) | Assignment between existing objects: `a = b` |
| Syntax | `T(const T&)` | `T& operator=(const T&)` |

> 💡 **Mnemonic**:
> - If an object **must first be created** before copying → **copy constructor**
> - If the object **already exists** → **copy assignment**

```cpp
Fraction f1 { 5, 3 };    // Ordinary ctor
Fraction f2 { f1 };       // Copy ctor (f2 is a new object)
Fraction f3;              // Default ctor
f3 = f1;                  // Copy assignment (f3 already exists)
```

### 12.2 Basic Structure

**The assignment operator must be a member function!** It cannot be a non-member.

```cpp
class Fraction {
public:
    // Overload operator=
    Fraction& operator=(const Fraction& fraction) {
        m_numerator = fraction.m_numerator;
        m_denominator = fraction.m_denominator;
        return *this;  // Return *this to support chained assignment
    }
};
```

### 12.3 Why Return `*this`?

To support **chained assignment**:

```cpp
Fraction f1{5, 3}, f2{7, 2}, f3{9, 5};
f1 = f2 = f3;  // Equivalent to f1 = (f2 = f3)
//          └─ This expression needs to produce a Fraction value (or reference), hence return *this
```

### 12.4 Self-Assignment

C++ allows self-assignment:
```cpp
Fraction f1{5, 3};
f1 = f1;  // Legal, but can misbehave with some operator= implementations
```

**For simple classes, self-assignment at worst wastes time.** But **for dynamic-memory classes, self-assignment can be disastrous!**

```cpp
// Dangerous version (no self-assignment handling)
MyString& operator=(const MyString& str) {
    if (m_data) delete[] m_data;   // ⚠️ If str is *this, we just deleted the shared memory!
    m_length = str.m_length;
    m_data = new char[str.m_length];
    std::copy_n(str.m_data, m_length, m_data);  // Copying from freed str.m_data → garbage
    return *this;
}

int main() {
    MyString alex{ "Alex", 5 };
    alex = alex;  // Garbage output!
}
```

### 12.5 Self-Assignment Guard

```cpp
MyString& operator=(const MyString& str) {
    // Self-assignment check
    if (this == &str)
        return *this;

    if (m_data) delete[] m_data;
    m_length = str.m_length;
    m_data = new char[str.m_length];
    std::copy_n(str.m_data, m_length, m_data);
    return *this;
}
```

> 💡 **Key Insight**: Use `this == &str` to **compare addresses** (not `*this == str`, which compares values), because:
> 1. Address comparison is fast (cheaper than `operator==`)
> 2. It doesn't require the class to define `operator==`

### 12.6 When Is the Self-Assignment Check Unnecessary?

1. **Not needed in the copy constructor**: the new object has just been created; it can't equal itself (except in oddities like `someClass c{c}`, which the compiler warns about as uninitialized)
2. **Not needed for simple classes (no dynamic memory)**: self-assignment wastes at most a few CPU cycles

---

## 13. Move Constructors and Move Assignment

> Corresponds to LearnCpp 22.3 — Move Constructors and Move Assignment

### 13.1 The Problem with Copy: It's Inefficient

Consider this code (using deep copy):

```cpp
Auto_ptr3<Resource> generateResource() {
    Auto_ptr3<Resource> res{ new Resource };
    return res;  // Calls the copy constructor!
}

int main() {
    Auto_ptr3<Resource> mainres;
    mainres = generateResource();  // Calls copy assignment!
}
```

**Possible output (6 resource operations)**:
```
Resource acquired     // res constructed
Resource acquired     // temporary copy-constructed (deep copy)
Resource destroyed    // res destructed
Resource acquired     // mainres copy-assigned (deep copy)
Resource destroyed    // temporary destructed
Resource destroyed    // mainres destructed
```

**Problem**: `res` is about to die anyway, yet we labor to **deep-copy** its resource to the temporary, then destroy `res`. **Why not just "steal" the resource?**

### 13.2 Move Semantics: Steal the Resource!

C++11 introduced the **move constructor** and **move assignment operator**, whose purpose is to **transfer resource ownership** from one object to another, rather than copying.

Key difference: **the parameter is a non-const rvalue reference (`&&`)**, not `const T&`.

```cpp
template<typename T>
class Auto_ptr4 {
    T* m_ptr {};
public:
    // Move constructor
    Auto_ptr4(Auto_ptr4&& a) noexcept
        : m_ptr{ a.m_ptr }
    {
        a.m_ptr = nullptr;  // ⭐ Critical: null out the source pointer
    }

    // Move assignment
    Auto_ptr4& operator=(Auto_ptr4&& a) noexcept {
        if (&a == this)
            return *this;

        delete m_ptr;         // Release our own resource first
        m_ptr = a.m_ptr;      // Take over a's resource
        a.m_ptr = nullptr;    // ⭐ Null out a
        return *this;
    }
    // ...
};
```

### 13.3 Output With Move

Same `generateResource() → mainres = ...`, now output:

```
Resource acquired
Resource destroyed
```

**Only one resource allocation!** A big efficiency win.

### 13.4 Why Must the Source Pointer Be Set to nullptr?

```cpp
a.m_ptr = nullptr;  // Very important!
```

**Reason**: the moved-from object **will still be destructed**. If `a.m_ptr` isn't nulled, its destructor will delete the memory we just stole, causing a **redundant delete error**!

> ⚠️ **Warning in the PPT**:
> ```
> Q) What happens if my move leaves s.buf pointing at array?
> A) When the source is destructed, it deletes the same memory → redundant delete → UB!
> ```

### 13.5 What Is `&&`: Rvalue Reference

**`&&` is called an rvalue reference**. It can only bind to an rvalue (a temporary object about to be destroyed).

| Property | Lvalue Reference `T&` | Rvalue Reference `T&&` |
|---|---|---|
| Binds to lvalue (named object) | ✅ | ❌ |
| Binds to rvalue (temporary) | ❌ (unless const) | ✅ |
| Purpose | Modify existing object, avoid copy | Say "this one's dying, I can steal its resource" |

### 13.6 When Is the Move Constructor Called?

A move function is invoked **only when**:
1. The move function **has been defined**
2. The **argument is an rvalue** (a temporary, or the result of `std::move()`)

If no move function exists, the compiler falls back to the copy function.

### 13.7 The noexcept Keyword

Move functions should be marked **`noexcept`**, telling the compiler they don't throw. This matters for containers like `std::vector` — they only use `noexcept` moves.

### 13.8 Construction vs Assignment (PPT Question)

**PPT question**: "What's the difference between construction and assignment?"

| Construction | Assignment |
|---|---|
| Object is brand new, **no existing resource to release** | Object already exists, **may hold an old resource to release first** |
| Takes over the source's resource directly | Deletes its own old resource first, then takes over |
| No self-check needed (a new object can't `==` itself) | Self-check needed to avoid accidental deletion |

### 13.9 Rule of Five (Brief Intro)

With move, the Rule of Three extends to the **Rule of Five**:

1. Destructor
2. Copy constructor
3. Copy assignment
4. **Move constructor** (new)
5. **Move assignment** (new)

If a class manages resources, these 5 usually all need to be written (or explicitly `= default` / `= delete`).

---

## 14. The Rule of Three — Lecture Supplement

> Corresponds to PPT "Dynamic Allocation of Arrays"

### 14.1 Statement of the Rule

> **RULE OF THREE**: If your class contains any pointer (managing dynamic memory), you must write three things yourself:
> 1. **Destructor**
> 2. **Copy Constructor**
> 3. **Copy Assignment**

**Why**: The compiler-provided defaults are **shallow copies**, which for pointer members produce:
- Shared memory
- Double delete
- Dangling pointer

### 14.2 Vector Class Example (PPT)

```cpp
class Vector {
    int maxLen;
    int* buf;

public:
    // 1) Ordinary ctor
    Vector(int newLen)
        : maxLen{ newLen }, buf{ new int[newLen] } {}

    // 2) Destructor
    ~Vector() {
        delete[] buf;
    }

    // 3) Copy constructor (deep copy)
    Vector(const Vector& v)
        : maxLen( v.maxLen ), buf( new int[v.maxLen] )
    {
        for (int i = 0; i < v.maxLen; ++i)
            buf[i] = v.buf[i];
    }

    // 4) Copy assignment
    Vector& operator=(const Vector& v) {
        if (this != &v) {       // self-assignment check
            maxLen = v.maxLen;
            delete[] buf;
            buf = new int[v.maxLen];
            for (int i = 0; i < maxLen; ++i)
                buf[i] = v.buf[i];
        }
        return *this;           // support chained assignment
    }
};
```

### 14.3 What Goes Wrong with the Defaults?

**PPT question**: "What happens if I use the default copy constructor or operator=()?"

```cpp
String::~String() { delete[] buf; }

// Case A: using the defaults
String::String(String& s) = default;                   // shallow copy
String& String::operator=(String& s) = default;        // shallow copy
// → Two Strings share buf → one destructs → the other dangles; and double delete

// Case B: empty implementations
String::String(String& s) {}                    // buf uninitialized (garbage)
String& String::operator=(String& s) { return *this; }  // copies nothing
// → New object's buf is garbage; destructor deletes a garbage address → crash
```

### 14.4 const & Version of operator==

```cpp
class Vector {
    int maxLen;
    int* buf;
public:
    bool operator==(const Vector& v) {
        if (maxLen != v.maxLen)    // compare length first (cheap)
            return false;
        for (int i = 0; i < maxLen; ++i)
            if (buf[i] != v.buf[i])
                return false;
        return true;
    }
};
```

> 💡 **Key Insight**: Use `const &` parameters for comparison (read-only + efficient).

---

## 15. Class Vector / IntList — Lecture Supplement

> Corresponds to the full `IntList` example in PPT "Dynamic Allocation of Arrays"

### 15.1 Structure of IntList

`IntList` is a flexible integer list mimicking `std::vector`:

```cpp
#define DEFAULT_SIZE 10

class IntList {
private:
    int maxLen;   // Capacity (physical size — the most it can hold)
    int curLen;   // Logical length (how much it currently holds)
    int* buf;     // Pointer to the dynamic array
    // ...
};
```

> 💡 **Physical size vs Logical size**: This is the core design of the HW4 `String` class — the buffer size is one thing, the number of characters actually stored is another.

### 15.2 Helper Methods

```cpp
bool in_bounds(int i) { return i >= 0 && i < curLen; }

// Static helper: copy n elements from one buffer to another
static void copy(int* to, int* from, int n) {
    for (int i = 0; i < n; ++i)
        to[i] = from[i];
}

// Core operation: grow
void increaseArrayTo(int newSize) {
    int* oldBuf = buf;
    buf = new int[newSize];       // 1. Allocate a bigger array
    copy(buf, oldBuf, curLen);    // 2. Copy elements over
    maxLen = newSize;             // 3. Update capacity
    // curLen unchanged
    delete[] oldBuf;              // 4. Free the old array
}
```

### 15.3 Constructor + append

```cpp
IntList(int newLen = DEFAULT_SIZE)
    : maxLen( newLen ), curLen( 0 ), buf( new int[newLen] )
{
    assert(newLen > 0);  // #include <cassert>
}

void append(int value) {
    if (curLen == maxLen)
        increaseArrayTo(maxLen + DEFAULT_SIZE);  // full → grow
    buf[curLen++] = value;
}
```

### 15.4 Operator Overloads

```cpp
// Subscript (returns a reference, usable as lvalue)
int& operator[](int index) {
    assert(in_bounds(index));
    return buf[index];
}

// Assignment (with growth)
IntList& operator=(const IntList& l) {
    if (maxLen < l.curLen)
        increaseArrayTo(l.curLen);
    copy(buf, l.buf, l.curLen);
    curLen = l.curLen;
    return *this;
}

// Equality
bool operator==(const IntList& l) {
    if (curLen != l.curLen) return false;
    for (int i = 0; i < curLen; ++i)
        if (buf[i] != l.buf[i]) return false;
    return true;
}

// Inequality, reuses equality
bool operator!=(const IntList& l) {
    return !operator==(l);
}
```

### 15.5 A Clever remove Implementation

```cpp
int indexOf(int value) {
    for (int i = 0; i < curLen; ++i)
        if (buf[i] == value) return i;
    return -1;
}

void remove(int value) {
    int i = indexOf(value);
    if (i != -1)
        buf[i] = buf[--curLen];  // ⭐ Move the last element here, shrink length by 1
}
```

> 💡 **Trick**: No need to shift all trailing elements — just overwrite with the last one (but the order is not preserved).

### 15.6 Move Version

```cpp
// Move constructor (no const — we need to modify the source)
IntList(IntList&& l)
    : maxLen( l.maxLen ), curLen( l.curLen ), buf( l.buf )
{
    l.buf = nullptr;  // ⭐ Very important to avoid redundant delete
}

// Move assignment
IntList& operator=(IntList&& l) {
    delete[] buf;              // Release our old resource
    curLen = l.curLen;
    maxLen = l.maxLen;
    buf = l.buf;
    l.buf = nullptr;           // ⭐ Again, null out the source pointer
    return *this;
}
```

### 15.7 HW4 Tips

> 💡 **Key HW4 points from lecture**:
> 1. **`strdup()` helper**: allocate + copy in one go; avoids calling `new[]` and `strcpy()` repeatedly
> 2. **Private helper constructor `String(int length)`**: allocates an array of the given size without initializing contents. Used by `reverse()` and `operator+()` to avoid multiple allocations
> 3. **`String::swap`**: swaps `this->buf` with the argument's `buf`, used for move operations. `std::swap` from `<utility>` also works
> 4. **Don't use VLA in `reverse()`**: `char temp[buf_len + 1]` is not legal C++
> 5. **Don't use `in >> buf` in `read()`**: `buf`'s physical size is limited, so overflow is easy

---

## 16. Week 4 Cheat Sheet and Pitfalls

### 16.1 Constants Cheat Sheet

| Scenario | Use |
|---|---|
| Initializer is a **literal** or **constant expression** | `constexpr` |
| Initializer is known **only at runtime** (e.g., `cin >> x`) | `const` |
| **Integer array length** (needed at compile time) | `constexpr int size = 10;` |
| **Dynamic-memory types** like `std::string`, `std::vector` | `const` (can't be `constexpr`) |

### 16.2 Pointers vs References

| Property | Pointer `T*` | Reference `T&` | Rvalue Ref `T&&` |
|---|---|---|---|
| Nullable | ✅ | ❌ | ❌ |
| Rebindable | ✅ | ❌ | ❌ |
| Syntax | `*p`, `p->` | Use directly | Use directly |
| Binds to | Anything | Lvalue | Rvalue |
| Typical use | Dynamic memory, optional params | Modify parameters, avoid copies | Move semantics |

### 16.3 The Four new/delete Combos

| Operation | Allocate | Free |
|---|---|---|
| Single object | `new T` / `new T(x)` | `delete p;` |
| Array | `new T[n]` / `new T[n]{}` | `delete[] p;` |

> ⚠️ **Mixing is UB!** `new` pairs with `delete`; `new[]` pairs with `delete[]`.

### 16.4 Rule of Three / Five

| Rule | Functions to write |
|---|---|
| **Rule of Three** (C++98) | Destructor, copy ctor, copy assignment |
| **Rule of Five** (C++11) | The above three + move ctor + move assignment |
| **Rule of Zero** | Use resource-managing classes (`std::string`, `std::vector`, etc.) — write nothing |

### 16.5 Copy vs Move

| Property | Copy | Move |
|---|---|---|
| Parameter type | `const T&` | `T&&` (non-const) |
| When called | Lvalue argument, return value (unless elided) | Rvalue argument, `std::move` |
| What it does | Deep-copies the resource | Steals the resource (shallow copy + null out source) |
| Source state | Unchanged | Nulled out (but still destructed) |
| Cost | O(n) data copy | O(1) pointer manipulation |

### 16.6 Python vs C++ (New for Week 4)

| Python | C++ | Notes |
|---|---|---|
| `x if cond else y` | `cond ? x : y` | Ternary operator, different argument order |
| `list.append(x)` | Implement growth yourself (or use `std::vector::push_back`) | C arrays don't auto-grow |
| Garbage collection | Manual `new`/`delete` or RAII | C++ has no GC |
| `==` compares values | Must overload `operator==` | Default compares pointers/addresses |
| `copy.deepcopy()` | Write your own deep-copy constructor | Needs Rule of Three |
| `list[-1]` | **Negative indexing not supported!** OOB is UB | Must `arr[len-1]` |
| Object assignment = rebinds reference | `a = b` calls copy assignment (unless you use pointers) | Semantics differ fundamentally |

### 16.7 Prof. Klefstad's Key Quotes (PPT)

| Quote | Meaning |
|---|---|
| "I just want to get it to work" → wrong mindset | Write it clean first, then correct |
| "I'll clean it up later" → wrong mindset | "Later" is often "never" |
| Functions > 5 lines → refactor it | Keep functions short |
| Test each piece | Incremental testing |
| "Wisdom: restrict dynamic allocation to class implementations" | Hide `new`/`delete` inside classes |
| "With great power comes great responsibility" | Dynamic memory is powerful but demands discipline |

### 16.8 Week 4 Pitfall Checklist

> ⚠️ **These can cost points on the quiz:**

1. **`new[]` with `delete`** (should be `delete[]`)
2. **Copy constructor taking parameter by value** (must be a reference; otherwise infinite recursion)
3. **Copy constructor/assignment forgetting const** (can't initialize from a const object)
4. **Copy assignment forgetting the self-assignment check**, deleting its own data
5. **Move constructor forgetting to null out the source pointer** (double delete)
6. **Modifying a `char*` string literal** (`char* s = "Hello"; s[0] = 'M';` is UB)
7. **Returning a pointer to a local variable** (dangling pointer)
8. **No `delete[]` for a dynamic array** (memory leak)
9. **Forgetting `operator=` to return `*this`** (chained assignment breaks)
10. **`constexpr` on a function parameter** (not allowed)
11. **`float f{4.1};`** (4.1 is a double, triggers a warning; use `4.1f`)
12. **Conditional operator without parentheses in a compound expression** (precedence trap)

### 16.9 Top Five Memory Points for Week 4

1. **Rule of Three**: a class with pointers must define destructor + copy ctor + copy assignment, otherwise the default shallow copy causes double delete and dangling pointers
2. **`new[]` / `delete[]` must be paired**: mixing `new` with `delete[]` (or vice versa) is UB
3. **Copy constructor parameter must be `const T&`**: pass-by-value causes infinite recursion
4. **The essence of move semantics is "stealing the resource"**: `a.m_ptr = nullptr` is critical, otherwise the source's destructor causes a redundant delete
5. **`constexpr` requires compile-time evaluability**: function parameters cannot be `constexpr`; dynamic-memory types (like `std::string`) are incompatible with `constexpr`, use `const`
