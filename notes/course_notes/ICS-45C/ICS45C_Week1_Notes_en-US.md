# Information and Computer Science 45C — Week 1 Integrated Reading Notes

## Table of Contents

- [1. Big Picture & Learning Path](#1-big-picture--learning-path)
- [2. Your First Program & the Build Pipeline](#2-your-first-program--the-build-pipeline)
- [3. Variables, Types & Initialization](#3-variables-types--initialization)
- [4. Input, Output & Strings](#4-input-output--strings)
- [5. Operators, Expressions & Primitive Data](#5-operators-expressions--primitive-data)
- [6. Control Structures](#6-control-structures)
- [7. Functions, Parameters & Scope](#7-functions-parameters--scope)
- [8. Arrays & Pointers](#8-arrays--pointers)
- [9. GoogleTest Primer](#9-googletest-primer)
- [10. Sample Quiz 0 (Week 2)](#10-sample-quiz-0-week-2)
- [11. Quick Reference Table](#11-quick-reference-table)

> UCI ICS 45C: Programming in C++ (35770)  
> This document merges overlapping Week 1 content from `cpp4python` and `LearnCpp.com`, organized in learning order.

---

## 1. Big Picture & Learning Path

The goal of Week 1 is not "learn a lot of syntax" but rather to build a complete introductory chain for C++:

1. First, understand how a C++ program goes from source code to an executable
2. Then, master the basic program structure: `main()`, statements, comments, formatting
3. Next, learn variables, types, initialization, I/O, and expressions
4. Build on that to cover conditionals, loops, functions, arrays, and pointers
5. Finally, get introduced to the testing tool GoogleTest

**Study Tips:**

- Type out every example by hand — don't just read
- Predict the output first, then run to verify
- Change one small thing at a time and observe the effect
- Compile as you go — don't accumulate a pile of errors
- When stuck, first identify *which layer* is the problem: syntax, types, logic, or the build pipeline

**Five Steps of Development:**

1. **Define the problem** — What are you solving?
2. **Determine solution** — Design it: keep it simple, modular, error-aware
3. **Write the program** — Code it up
4. **Compile** — Build into an executable
5. **Test and debug** — Verify and fix

> Think of Week 1 as: first learn *how a program exists*, then learn *how it runs*.

---

## 2. Your First Program & the Build Pipeline

### 2.1 C++ vs Python: Compiled vs Interpreted

C++ is a **compiled language**; Python is an **interpreted language**.

```bash
g++ -o myprogram myprogram.cpp
./myprogram
```

- C++ code must be compiled before it can run
- The compilation phase catches many syntax and type errors early
- This is one reason C++ is "stricter"

### 2.2 A Minimal C++ Program

```cpp
#include <iostream>

int main() {
    std::cout << "Hello, world!\n";
    return 0;
}
```

```text
// Output:
Hello, world!
```

Key elements you must recognize in Week 1:

- `#include <iostream>` — brings in the standard I/O library
- `main()` — the program entry point
- `{}` — code blocks
- `;` — statement terminator
- `return 0;` — tells the OS the program finished successfully

### 2.3 `main()`, Statements, and Comments

A **statement** is the smallest independent unit of execution in C++, usually ending with `;`.

```cpp
int x;
x = 5;
std::cout << x;   // Output: 5
return 0;
```

**Comments** come in two forms:

```cpp
// single-line comment
/* multi-line
   comment */
```

Good comments explain **why**, not just **what**.

### 2.4 Headers & Namespaces

```cpp
#include <iostream>
using namespace std;
```

- `#include` is a **preprocessor directive**
- `<iostream>` provides `cout` and `cin`
- `using namespace std;` lets you skip writing `std::` everywhere

However, explicitly writing `std::cout` / `std::cin` is preferred because:

- Better readability
- Avoids naming conflicts
- Aligns with modern C++ conventions

### 2.5 Compiler, Linker, Loader

The full pipeline can be understood as:

```text
Source code (.cpp/.hpp)
  -> Preprocessor
  -> Compiler
  -> Object file
  -> Linker
  -> Executable
  -> Loader
  -> Execution starts at main()
```

Responsibilities:

- **Preprocessor** — handles `#include`, `#define`, etc.
- **Compiler** — checks syntax, translates `.cpp` into object files
- **Linker** — combines multiple object files and libraries into one executable
- **Loader** — loads the executable into memory at runtime

A **library** is a pre-written, reusable collection of code:

- Standard library: e.g., `iostream`, `string`
- Third-party libraries: e.g., GoogleTest (used later)

### 2.6 Code Formatting & Naming

- C++ ignores most whitespace, but **humans don't**
- Keep brace style consistent
- Keep indentation uniform
- Use descriptive identifiers

**Naming rules:**

- May contain letters, digits, and underscores
- Cannot start with a digit
- Case-sensitive
- Cannot use keywords like `int`, `return`, `while`

---

## 3. Variables, Types & Initialization

### 3.1 Objects, Variables & Static Typing

Core concepts:

- **data** — information
- **object** — a region of memory that holds a value
- **variable** — a named object
- **identifier** — the variable's name

```cpp
int x;
double price;
bool done;
```

C++ is a **statically typed language**:

- Every variable must have a type when created
- Once the type is set, it determines how the value is stored and interpreted

This differs from Python, where you can write:

```python
x = 5
x = "hello"
```

In C++, an `int x` cannot later become a string variable.

### 3.2 Definition, Assignment, Initialization

```cpp
int x;      // definition
x = 5;      // assignment

int a = 5;  // copy initialization
int b(5);   // direct initialization
int c{5};   // brace initialization
int d{};    // value initialization -> 0
```

The most important Week 1 takeaway:

- **Initialize variables at the point of definition**
- **Prefer `{}`**

```cpp
int x{4.5};   // compile error — prevents narrowing conversion
int y = 4.5;  // compiles, but value becomes 4
```

So `{}` is safer.

### 3.3 Uninitialized Variables & Undefined Behavior

```cpp
int x;
std::cout << x;   // dangerous
```

If a local variable is not initialized, it typically contains a **garbage value**.

This leads to **undefined behavior (UB)**:

- Might output a strange number
- Might crash
- Might "appear to work fine"

But "appears to work fine" does not mean the code is correct.

**Best practice: always initialize a variable when you create it.**

### 3.4 Constants & Magic Numbers

```cpp
constexpr double pi{3.1415926};
constexpr char newline{'\n'};
```

- `constexpr` denotes a compile-time constant
- Constants cannot be modified
- Named constants are clearer than raw numbers

```cpp
double area(double r) {
    return pi * r * r;
}
```

### 3.5 Common Fundamental Types in Week 1

| Type | Purpose |
|------|---------|
| `int` | Integers |
| `float` / `double` | Floating-point numbers |
| `bool` | True / false |
| `char` | A single character |
| `pointer` | An address |

Modifiers:

- `short`
- `long`
- `unsigned`

These affect the range of values or memory usage.

---

## 4. Input, Output & Strings

### 4.1 `cout`, `cin`, `endl`

```cpp
#include <iostream>

int main() {
    int x{};
    std::cin >> x;
    std::cout << "You entered: " << x << '\n';
    return 0;
}
```

```text
// Input: 42
// Output:
You entered: 42
```

- `std::cout <<` — output
- `std::cin >>` — input
- `std::endl` — newline *and* flushes the buffer
- `'\n'` — newline only, usually more efficient

```cpp
std::cout << "Hello" << std::endl;
std::cout << "Hello\n";
```

Week 1 recommendation: prefer `'\n'`.

### 4.2 Insertion / Extraction Operators

```cpp
std::cout << "A" << "B" << '\n';   // Output: AB
std::cin >> value;
```

- `<<` — insertion operator
- `>>` — extraction operator

They can be chained:

```cpp
std::cout << "x = " << x << '\n';
```

### 4.3 Word Input vs Line Input

```cpp
std::string name{};
std::cin >> name;
```

This reads only the **next word** — it stops at whitespace.

To read an entire line:

```cpp
#include <string>

std::string line{};
std::getline(std::cin, line);
```

### 4.4 `char` and `string`

```cpp
char letter{'A'};
std::string name{"Hello"};
```

- `'A'` is a `char`
- `"Hello"` is a string literal
- In this course, single quotes → think "single character"

In Python, `'a'` and `"a"` are essentially the same; in C++ they are different concepts.

### 4.5 Basic `string` Operations

```cpp
#include <string>

std::string s{"Hello"};
std::cout << s[0] << '\n';         // Output: H
std::cout << s.size() << '\n';     // Output: 5

for (char c : s) {
    std::cout << c << ' ';
}
// Output: H e l l o
```

- `s[i]` — access character by index
- `s.size()` — length
- Range-based `for` iterates character by character

---

## 5. Operators, Expressions & Primitive Data

### 5.1 Numeric Types & Integer Division

```cpp
std::cout << 7 / 3 << '\n';     // 2
std::cout << 7.0 / 3 << '\n';   // 2.333...
std::cout << 7 % 3 << '\n';     // 1
```

Critical rules:

- `int / int` performs **integer division**
- `%` is the modulus operator, integers only

| Python | C++ |
|--------|-----|
| `7 // 3` | `7 / 3` |
| `7 / 3` | `7.0 / 3` |
| `2 ** 10` | `pow(2, 10)` |

### 5.2 Booleans & Logical Operators

```cpp
bool flag{true};
bool test{false};
```

| Python | C++ |
|--------|-----|
| `and` | `&&` |
| `or` | `\|\|` |
| `not` | `!` |

Relational operators:

- `<`, `>`, `<=`, `>=`, `==`, `!=`

### 5.3 Literals & Operators

A **literal** is a value written directly in code:

```cpp
5
3.14
'A'
"Hello"
true
```

An **operator** is a symbol that performs an operation on values:

- Arithmetic: `+ - * / %`
- Assignment: `= += -= *= /= %=`
- Comparison: `== != < >`
- Logical: `&& || !`

### 5.4 Increment, Decrement & Precedence

```cpp
int x{10};
x++;
x--;
```

- `x++` — increment
- `x--` — decrement

When in doubt about precedence, the safest approach is to **use parentheses**.

```cpp
2 + 3 * 4;    // 14
(2 + 3) * 4;  // 20
```

### 5.5 Expressions & Expression Statements

```cpp
2 + 3
x = 5
x
```

These are all **expressions**.

An expression followed by a semicolon becomes an **expression statement**:

```cpp
x = 5;
```

### 5.6 Key Takeaways

- In C++, values and types are bound more tightly
- Operators are affected by the types of their operands
- `int / int` is one of the easiest Week 1 pitfalls

---

## 6. Control Structures

### 6.1 `if / else if / else`

```cpp
if (score >= 90) {
    std::cout << "A\n";
} else if (score >= 80) {
    std::cout << "B\n";
} else {
    std::cout << "F\n";
}
```

- Conditions must be in `()`
- Code blocks go in `{}`
- Python's `elif` becomes `else if` in C++

### 6.2 `switch`

```cpp
switch (grade) {
    case 'A': std::cout << "Excellent"; break;
    case 'B': std::cout << "Good"; break;
    default:  std::cout << "Other";
}
```

Key points:

- Good for discrete-value checks
- Usually needs `break` after each `case`
- `default` handles "everything else"

### 6.3 `while`

```cpp
int count{0};
while (count < 5) {
    std::cout << count << '\n';
    ++count;
}
```

```text
// Output:
0
1
2
3
4
```

### 6.4 `for`

```cpp
for (int i{0}; i < 10; ++i) {
    std::cout << i << '\n';
}
```

```text
// Output:
0
1
2
3
4
5
6
7
8
9
```

Python equivalent:

| Python | C++ |
|--------|-----|
| `for i in range(10):` | `for (int i = 0; i < 10; ++i)` |

### 6.5 Range-based `for`

```cpp
for (int n : nums) {
    std::cout << n << '\n';
}
```

This is closer to Python's:

```python
for x in nums:
    print(x)
```

### 6.6 `break` and `continue`

```cpp
for (int i{0}; i < 10; ++i) {
    if (i == 3) {
        continue;
    }
    if (i == 8) {
        break;
    }
    std::cout << i << '\n';
}
```

```text
// Output: (skips 3, stops at 8)
0
1
2
4
5
6
7
```

- `continue` — skip the rest of the current iteration
- `break` — exit the entire loop

---

## 7. Functions, Parameters & Scope

### 7.1 Why Use Functions

Four key benefits:

1. Break large problems into smaller ones
2. Reuse code, avoid repetition
3. Easier to test
4. Easier to maintain and extend

**Ideally, each function should do one thing.**

### 7.2 Defining Functions

```cpp
int add(int a, int b) {
    return a + b;
}

void greet(std::string name) {
    std::cout << "Hello " << name << '\n';
}
```

- Functions must specify a return type
- Parameters must also have types
- `void` means no return value

### 7.3 Declaration vs Definition

```cpp
double average(double x, double y);   // declaration

int main() {
    std::cout << average(2.0, 3.0) << '\n';   // Output: 2.5
}

double average(double x, double y) {  // definition
    return (x + y) / 2.0;
}
```

- **Declaration** — tells the compiler "this exists"
- **Definition** — provides the actual implementation
- Before a call, the compiler must have seen at least the declaration

### 7.4 Return Values & `void`

```cpp
int getValueFromUser() {
    int input{};
    std::cin >> input;
    return input;
}
```

```cpp
void printHello() {
    std::cout << "Hello!\n";
}
```

Rules:

- An `int` function must return an `int`
- A `void` function returns nothing
- Forgetting `return` in a non-`void` function may cause UB

### 7.5 Parameters, Arguments & Pass by Value

```cpp
void print(int x) {
    std::cout << x << '\n';
}

print(5);   // Output: 5
```

- `x` is the **parameter** (formal parameter)
- `5` is the **argument** (actual parameter)

By default, C++ uses **pass by value**:

- The function receives a copy
- Modifying the copy does not affect the original variable

```cpp
void addOne(int x) {
    ++x;   // only modifies the copy — original is unchanged
}

int a{5};
addOne(a);
std::cout << a << '\n';   // Output: 5 (a is unchanged)
```

### 7.6 Local Scope

```cpp
void func() {
    int x{5};
    std::cout << x;
}
```

- Local variables are created at the point of definition
- They are destroyed when their enclosing block ends
- Identically named locals in different functions are independent

---

## 8. Arrays & Pointers

### 8.1 Arrays

```cpp
int scores[5] = {90, 85, 78, 92, 88};
std::cout << scores[0] << '\n';   // Output: 90
```

| Python list | C++ array |
|-------------|-----------|
| Dynamic size | Fixed size |
| Mixed types allowed | Must be same type |
| Out-of-bounds → exception | Out-of-bounds → possible UB |
| `append()` | Not supported |

### 8.2 Arrays as Function Parameters

```cpp
double average(int list[], int length) {
    double total{0};
    for (int i{0}; i < length; ++i) {
        total += list[i];
    }
    return total / length;
}
```

When passing an array to a function, you typically pass the length as well.

### 8.3 Pointers

> A pointer is a variable that stores an address.

```cpp
int value{100};
int* ptr{&value};

std::cout << value << '\n';    // Output: 100
std::cout << &value << '\n';   // Output: a memory address, e.g. 0x7ffd5e3a2b4c
std::cout << *ptr << '\n';     // Output: 100
```

Three things you must distinguish:

- `&x` — address-of operator
- `int* ptr` — declares a pointer
- `*ptr` — dereference, retrieves the value pointed to

```cpp
*ptr = 2000;
std::cout << value << '\n';   // 2000
```

### 8.4 `nullptr`

```cpp
int* ptr{nullptr};
```

- `nullptr` means "points to nothing"
- Dereferencing a null pointer is a serious error

---

## 9. GoogleTest Primer

### 9.1 Basic Hierarchy

```text
Test Program
  -> Test Suite
    -> Test
      -> Assertion
```

- **Assertion** — checks a condition
- **Test** — a group of assertions
- **Test Suite** — a collection of related tests

### 9.2 `EXPECT_*` vs `ASSERT_*`

| Type | On Failure | Use When |
|------|-----------|----------|
| `EXPECT_*` | Non-fatal, continues execution | Most cases |
| `ASSERT_*` | Fatal, stops the current function | Subsequent code depends on this condition |

Common assertions:

- `EXPECT_TRUE(condition)`
- `EXPECT_FALSE(condition)`
- `EXPECT_EQ(a, b)`
- `EXPECT_NE(a, b)`
- `EXPECT_LT(a, b)`
- `EXPECT_LE(a, b)`
- `EXPECT_GT(a, b)`
- `EXPECT_GE(a, b)`
- `EXPECT_STREQ(s1, s2)`

### 9.3 A Simple Test

```cpp
#include <gtest/gtest.h>

TEST(FactorialTest, HandlesZeroInput) {
    EXPECT_EQ(Factorial(0), 1);
}

TEST(FactorialTest, HandlesPositiveInput) {
    EXPECT_EQ(Factorial(1), 1);
    EXPECT_EQ(Factorial(2), 2);
    EXPECT_EQ(Factorial(3), 6);
}
```

Rules:

- `TEST(TestSuiteName, TestName)`
- Names cannot contain underscores `_`
- Test names within the same suite must be unique

### 9.4 When to Use `ASSERT_*`

```cpp
TEST(QueueTest, DequeueWorks) {
    Queue q;
    q.Enqueue(1);
    int* n = q.Dequeue();

    ASSERT_NE(n, nullptr);
    EXPECT_EQ(*n, 1);

    delete n;
}
```

Without first asserting `n != nullptr`, the subsequent `*n` could crash.

---

## 10. Sample Quiz 0 (Week 2)

> ⚠️ **Note**: Sample Quiz 0 is **Week 2** content (given Thursday of Week 2). Included here for early reference.
>
> Assume all necessary `#include`s are present and correct.

### 10.1 Operator Precedence

Problem:

```cpp
x = +a + b * c - d / -e
y = z = -a - b / c * d
```

Fully parenthesized:

```cpp
(x = (((+a) + (b * c)) - (d / (-e))))
(y = (z = ((-a) - ((b / c) * d))))
```

### 10.2 Write `square`

```cpp
int square(int i) {
    return i * i;
}
```

### 10.3 Print `1` through `10` with Their Squares

```cpp
int main() {
    for (int i = 1; i <= 10; ++i) {
        std::cout << i << ' ' << square(i) << '\n';
    }
    return 0;
}
```

```text
// Output:
1 1
2 4
3 9
4 16
5 25
6 36
7 49
8 64
9 81
10 100
```

### 10.4 Object Lifetime

**Question:** Give the specific word describing each step in the lifetime of an object in C++.

**Answer:**

```
1) Birth
   1a) Allocation    — memory is reserved
   1b) Construction  — object is initialized
2) Life
3) Death
   3a) Destruction   — object is cleaned up
   3b) Deallocation  — memory is released
```

> ⚠️ It's **Destruction**, NOT ~~Deconstruction~~. -5 pts if you write "con".

### 10.5 What This Quiz Tests

This quiz simultaneously checks four things:

- Can you read operator precedence?
- Can you write a minimal function?
- Can you write a `for` loop?
- Do you have the "object lifetime" concept down?

---

## 11. Quick Reference Table

| Concept | Python | C++ |
|---------|--------|-----|
| Output | `print("hi")` | `cout << "hi" << '\n';` |
| Input | `x = input()` | `cin >> x;` |
| Variable | `x = 5` | `int x{5};` |
| Typing | Dynamic | Static |
| Integer division | `7 // 3` | `7 / 3` |
| Power | `2 ** 10` | `pow(2, 10)` |
| Boolean | `True / False` | `true / false` |
| Logic | `and / or / not` | `&& / \|\| / !` |
| Conditional | `if x > 0:` | `if (x > 0) {}` |
| `elif` | `elif` | `else if` |
| Loop | `for i in range(n):` | `for (int i = 0; i < n; ++i)` |
| Function | `def f(x):` | `int f(int x) {}` |
| No return | `def f():` | `void f() {}` |
| Character | `'a'` | `'a'` is `char` |
| String | `"abc"` | `std::string{"abc"}` |
| Array | `[1, 2, 3]` | `int a[]{1, 2, 3};` |
| Pointer | No direct equivalent | `int* p = &x;` |
| Null pointer | `None` | `nullptr` |
| Increment | `x += 1` | `++x` or `x++` |
| Testing | `assert` / `unittest` | GoogleTest |

**Five Most Important Week 1 Takeaways:**

1. C++ is a statically typed language
2. Initialize variables at definition — prefer `{}`
3. `int / int` is integer division
4. `main()` is the program entry point
5. Functions must be declared before they are called; the default passing mode is pass by value